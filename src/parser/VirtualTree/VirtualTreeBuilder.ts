import Tree from '../Tree';

import { VirtualTree, Episode } from './VirtualTree';
import { TitleParser } from '../Adapters/TitleParser';
import { FileSystemEditor } from '../Adapters/FSEditor';

export class VirtualTreeBuilder {
    private readonly path: string;
    private titleParser: TitleParser;
    private fileSystemEditor: FileSystemEditor;

    readonly rejected = new Array<Tree>();
    readonly virtualTree = new VirtualTree();

    constructor(path: string, titleParser: TitleParser, fileSystemEditor: FileSystemEditor) {
        this.path = path;
        this.titleParser = titleParser;
        this.fileSystemEditor = fileSystemEditor;
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

    commit() {
        this.virtualTree.forEach( (season, episode) => {
            const newFolder = `S${season.seasonNum}`;
            const newEpisode = episode.getNewEpisodeName();

            this.fileSystemEditor.makeDirectory(`${this.path}/${newFolder}`);
            this.fileSystemEditor.moveAndRename(episode.file.path, `${this.path}/${newFolder}/${newEpisode}`);
        });

        this.cleanup();
    }

    private cleanup() {
        if (this.rejected.length == 0) return;

        const rejected = `${this.path}/rejected`;
        this.fileSystemEditor.makeDirectory(rejected);
        this.rejected.forEach(file => this.fileSystemEditor.moveFileToFolder(file.path, rejected));
    }
}

