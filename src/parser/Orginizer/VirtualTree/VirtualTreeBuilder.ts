import Tree from '../../Tree/Tree';

import { VirtualTree, Episode } from './VirtualTree';
import { TitleParser } from '../../Adapters/TitleParser';
import { FileSystemEditor } from '../../Adapters/FSEditor';
import { DirectoryTreeCreator } from '../../Adapters/DirTreeCreator';
import FilePurger from '../DirManager/FilePurger';

type Options = {exclude?: RegExp, rejected?: string, purge?: string};

export class VirtualTreeBuilder {
    protected titleParser: TitleParser;
    protected fileSystemEditor: FileSystemEditor;
    protected dirTree: DirectoryTreeCreator;
    protected purger: FilePurger;
    
    protected rejected: Tree[] = [];
    readonly virtualTree = new VirtualTree();

    private options: {exclude: RegExp, rejected: string, purge: string};

    constructor(titleParser: TitleParser, fileSystemEditor: FileSystemEditor, dirTree: DirectoryTreeCreator, options?: Options) {
        this.titleParser = titleParser;
        this.fileSystemEditor = fileSystemEditor;
        this.dirTree = dirTree;
        this.options = this.setupOptions(options);

        this.purger = new FilePurger(this.fileSystemEditor);
    }

    private setupOptions(options?: Options) {
        const defaultOptions = { exclude: /.DS_Store|purge|rejected/, rejected: 'rejected', purge: 'purge' };

        if (options) {
            return {
                exclude: options.exclude ?? defaultOptions.exclude,
                rejected: options.rejected ?? defaultOptions.rejected,
                purge: defaultOptions.purge ?? defaultOptions.purge
            };
        } 

        return defaultOptions;
    }

    buildVirtualTreeFromFiles(files: Tree[]) {
        files.forEach(file => {
            const { season, episode } = this.titleParser.parse(file.name);

            if (season && episode) {
                try {
                    this.virtualTree.addEpisode(season, new Episode(episode, file));
                } catch (error) {
                    this.rejected.push(file);
                }
            } else {
                this.rejected.push(file);
            }
        });
    }

    buildVirtualTreeFromFolders(folders: Tree[]) {
        this.traverseFilesIn(folders, (folder, file) => {
            const {season, episode: episodeNumber } = this.titleParser.parse(file.name);
            const seasonNumber = season ?? this.titleParser.parseSeasonFrom(folder.name);

            if (episodeNumber && seasonNumber) {
                try {
                    this.virtualTree.addEpisode(seasonNumber, new Episode(episodeNumber, file));
                } catch (error) {
                    this.rejected.push(file);
                }
            } else {
                this.rejected.push(file);
            }
        });
    }

    /**
     * Commits the virtual tree to the file system.
     * Cleans up all the video files whose titles couldn't be parsed, and moves
     * them into the `rejected` folder. Then moves all folders in `path` with no videos into the `purge` 
     * folder (except `purge` & `rejected` folders).
     * 
     * @param path to the series folder
    */
    commit(path: string) {
        this.virtualTree.forEach( (season, episode) => {
            const newFolder = `S${season.seasonNum}`;
            const newEpisode = `E${episode.episodeNum}${episode.file.extension}`;
            
            this.fileSystemEditor.makeDirectory(`${path}/${newFolder}`);
            this.fileSystemEditor.moveAndRename(episode.file.path, `${path}/${newFolder}/${newEpisode}`);
            season.path = `${path}/${newFolder}`;
            episode.path = `${path}/${newFolder}/${newEpisode}`;
        });
        
        this.cleanup(path);
    }
    
    protected cleanup(path: string) {
        this.cleanRejectFolder(path, this.options.rejected);
        const tree = this.dirTree.treeFrom(path, this.options.exclude);
        this.rejected = tree.children.filter(child => child.isFolder && !child.contains(node => node.isVideo));
        this.cleanRejectFolder(path, this.options.purge);
        
        this.fileSystemEditor.deleteFile(`${path}/.DS_Store`);
    }
    
    private cleanRejectFolder(path: string, purgeFolder: string) {
        const paths = this.rejected.map(node => node.path);
        this.purger.insertPaths(paths);
        this.purger.purge(`${path}/${purgeFolder}`);
        this.rejected = [];
    }

    // --------------------------------------------------------------------------------
    // Mark: Utility methods
    // --------------------------------------------------------------------------------
    protected traverseFilesIn(folders: Tree[], apply: (folder: Tree, file: Tree) => void) {
        folders.forEach(folder => {
            folder.children.forEach(node => { 
                if (node.isFile) {
                    apply(folder, node);
                }
            })
        });
    }
}

