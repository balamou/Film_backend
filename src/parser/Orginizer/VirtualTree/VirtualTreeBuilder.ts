import Tree from '../../Tree/Tree';

import { VirtualTree, Episode } from './VirtualTree';
import { TitleParser } from '../../Adapters/TitleParser';
import { FileSystemEditor } from '../../Adapters/FSEditor';
import { DirectoryTreeCreator } from '../../Adapters/DirTreeCreator';
import FilePurger from '../../DirManager/FilePurger';

export class VirtualTreeBuilder {
    private titleParser: TitleParser;
    private fileSystemEditor: FileSystemEditor;
    private dirTree: DirectoryTreeCreator;

    private rejected: Tree[] = [];
    readonly virtualTree = new VirtualTree();

    constructor(titleParser: TitleParser, fileSystemEditor: FileSystemEditor, dirTree: DirectoryTreeCreator) {
        this.titleParser = titleParser;
        this.fileSystemEditor = fileSystemEditor;
        this.dirTree = dirTree;
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
            const seasonNumber = this.titleParser.parseSeasonFrom(folder.name);
            const episodeNumber = this.titleParser.parse(file.name).episode;

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
    
    private cleanup(path: string) {
        this.cleanRejectFolder(path);
        const tree = this.dirTree.treeFrom(path, /.DS_Store|purge|rejected/);
        this.rejected = tree.children.filter(child => child.isFolder && !child.contains(node => node.isVideo));
        this.cleanRejectFolder(path);
        
        this.fileSystemEditor.deleteFile(`${path}/.DS_Store`);
    }
    
    private cleanRejectFolder(path: string) {
        const purger = new FilePurger(this.fileSystemEditor);
        const paths = this.rejected.map(node => node.path);
        purger.insertPaths(paths);
        purger.purge(`${path}/rejected`);
        this.rejected = [];
    }

    // --------------------------------------------------------------------------------
    // Mark: Utility methods
    // --------------------------------------------------------------------------------
    private traverseFilesIn(folders: Tree[], apply: (folder: Tree, file: Tree) => void) {
        folders.forEach(folder => {
            folder.children.forEach(file => apply(folder, file));
        });
    }
}

