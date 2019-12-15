"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VirtualTree_1 = require("./VirtualTree");
class VirtualTreeBuilder {
    constructor(titleParser, fileSystemEditor, dirTree) {
        this.rejected = new Array();
        this.virtualTree = new VirtualTree_1.VirtualTree();
        this.titleParser = titleParser;
        this.fileSystemEditor = fileSystemEditor;
        this.dirTree = dirTree;
    }
    buildVirtualTree(files) {
        files.forEach(file => {
            const info = this.titleParser.parse(file.name);
            if (info.season && info.episode) {
                try {
                    this.virtualTree.addEpisode(info.season, new VirtualTree_1.Episode(info.episode, file));
                }
                catch (error) {
                    this.rejected.push(file);
                }
            }
            else {
                this.rejected.push(file);
            }
        });
    }
    buildVirtualTreeFromFolders(folders) {
        this.traverseFilesIn(folders, (folder, file) => {
            const seasonNumber = this.titleParser.parseSeasonFrom(folder.name);
            const episodeNumber = this.titleParser.parse(file.name).episode;
            if (episodeNumber && seasonNumber) {
                try {
                    this.virtualTree.addEpisode(seasonNumber, new VirtualTree_1.Episode(episodeNumber, file));
                }
                catch (error) {
                    this.rejected.push(file);
                }
            }
            else {
                this.rejected.push(file);
            }
        });
    }
    traverseFilesIn(folders, apply) {
        folders.forEach(folder => {
            folder.children.forEach(file => apply(folder, file));
        });
    }
    commit(path) {
        this.virtualTree.forEach((season, episode) => {
            const newFolder = `S${season.seasonNum}`;
            const newEpisode = episode.getNewEpisodeName();
            this.fileSystemEditor.makeDirectory(`${path}/${newFolder}`);
            this.fileSystemEditor.moveAndRename(episode.file.path, `${path}/${newFolder}/${newEpisode}`);
            episode.path = `${path}/${newFolder}/${newEpisode}`;
            season.path = `${path}/${newFolder}`;
        });
        this.cleanup(path);
    }
    cleanup(path) {
        this.cleanRejectFolder(path);
        // collect all empty folders
        const tree = this.dirTree.treeFrom(path, /.DS_Store|purge|rejected/);
        tree.children.forEach(child => {
            if (child.isFolder && !child.contains(node => node.isVideo))
                this.rejected.push(child);
        });
        this.cleanRejectFolder(path);
        this.fileSystemEditor.deleteFile(`${path}/.DS_Store`);
    }
    cleanRejectFolder(path) {
        if (this.rejected.length === 0)
            return;
        const rejected = `${path}/rejected`;
        this.fileSystemEditor.makeDirectory(rejected);
        this.rejected.forEach(file => this.fileSystemEditor.moveFileToFolder(file.path, rejected));
        this.rejected = [];
    }
}
exports.VirtualTreeBuilder = VirtualTreeBuilder;
