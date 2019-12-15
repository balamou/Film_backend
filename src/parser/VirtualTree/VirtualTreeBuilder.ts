import Tree from '../Tree';

import { VirtualTree, Episode } from './VirtualTree';
import { TitleParser } from '../Adapters/TitleParser';
import { FileSystemEditor } from '../Adapters/FSEditor';
import { DirectoryTreeCreator } from '../Adapters/DirTreeCreator';

export class VirtualTreeBuilder {
    private titleParser: TitleParser;
    private fileSystemEditor: FileSystemEditor;
    private dirTree: DirectoryTreeCreator;

    private rejected = new Array<Tree>();
    readonly virtualTree = new VirtualTree();

    constructor(titleParser: TitleParser, fileSystemEditor: FileSystemEditor, dirTree: DirectoryTreeCreator) {
        this.titleParser = titleParser;
        this.fileSystemEditor = fileSystemEditor;
        this.dirTree = dirTree;
    }

    buildVirtualTree(files: Tree[]) {
        files.forEach(file => {
            const info = this.titleParser.parse(file.name);

            if (info.season && info.episode) {
                try {
                    this.virtualTree.addEpisode(info.season, new Episode(info.episode, file));
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

    private traverseFilesIn(folders: Tree[], apply: (folder: Tree, file: Tree) => void) {
        folders.forEach(folder => {
            folder.children.forEach(file => apply(folder, file));
        });
    }

    commit(path: string) {
        this.virtualTree.forEach( (season, episode) => {
            const newFolder = `S${season.seasonNum}`;
            const newEpisode = episode.getNewEpisodeName();

            this.fileSystemEditor.makeDirectory(`${path}/${newFolder}`);
            this.fileSystemEditor.moveAndRename(episode.file.path, `${path}/${newFolder}/${newEpisode}`);
            episode.path = `${path}/${newFolder}/${newEpisode}`;
            season.path = `${path}/${newFolder}`;
        });

        this.cleanup(path);
    }

    private cleanup(path: string) {
        this.cleanRejectFolder(path);

        // collect all empty folders
        const tree = this.dirTree.treeFrom(path, /.DS_Store|purge|rejected/);
        tree.children.forEach(child => {
            if (child.isFolder && !child.contains(node => node.isVideo))
                this.rejected.push(child);
        });

        this.cleanRejectFolder(path);
    }

    private cleanRejectFolder(path: string) {
        if (this.rejected.length === 0) return;

        const rejected = `${path}/rejected`;
        this.fileSystemEditor.makeDirectory(rejected);
        this.rejected.forEach(file => this.fileSystemEditor.moveFileToFolder(file.path, rejected));
        this.rejected = [];
    }
}

