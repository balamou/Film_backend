"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VirtualTree_1 = require("./VirtualTree");
class VirtualTreeBuilder {
    constructor(path, titleParser, fileSystemEditor) {
        this.rejected = new Array();
        this.virtualTree = new VirtualTree_1.VirtualTree();
        this.path = path;
        this.titleParser = titleParser;
        this.fileSystemEditor = fileSystemEditor;
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
    commit() {
        this.virtualTree.forEach((season, episode) => {
            const newFolder = `S${season.seasonNum}`;
            const newEpisode = episode.getNewEpisodeName();
            this.fileSystemEditor.makeDirectory(`${this.path}/${newFolder}`);
            this.fileSystemEditor.moveAndRename(episode.file.path, `${this.path}/${newFolder}/${newEpisode}`);
            episode.path = `${this.path}/${newFolder}/${newEpisode}`;
            season.path = `${this.path}/${newFolder}`;
        });
        this.cleanup();
    }
    cleanup() {
        if (this.rejected.length == 0)
            return;
        const rejected = `${this.path}/rejected`;
        this.fileSystemEditor.makeDirectory(rejected);
        this.rejected.forEach(file => this.fileSystemEditor.moveFileToFolder(file.path, rejected));
    }
}
exports.VirtualTreeBuilder = VirtualTreeBuilder;
