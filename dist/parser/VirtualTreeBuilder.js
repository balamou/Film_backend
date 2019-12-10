"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VirtualTree_1 = require("./VirtualTree");
class VirtualTreeBuilder {
    constructor(titleParser) {
        this.rejected = [];
        this.virtualTree = new VirtualTree_1.VirtualTree();
        this.titleParser = titleParser;
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
            if (episodeNumber) {
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
}
exports.VirtualTreeBuilder = VirtualTreeBuilder;
