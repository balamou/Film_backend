"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class VirtualTree {
    constructor() {
        this.tree = [];
        this.addEpisode = (seasonNumber, episode) => {
            let seasonNode = this.tree.find(node => node.seasonNum === seasonNumber);
            if (!seasonNode) {
                seasonNode = new Season(seasonNumber);
                this.tree.push(seasonNode);
            }
            let episodeNode = seasonNode.episodes.find(node => node.episodeNum === episode.episodeNum);
            if (episodeNode)
                throw new Error("Episode already added in the tree");
            seasonNode.episodes.push(episode);
        };
        // Iterates through each episode of every season
        this.forEach = (apply) => {
            this.tree.forEach(season => {
                season.episodes.forEach(episode => apply(season, episode));
            });
        };
    }
}
exports.VirtualTree = VirtualTree;
class Season {
    constructor(seasonNum) {
        this.episodes = [];
        this.seasonNum = seasonNum;
    }
}
exports.Season = Season;
// export type FileContent = { name: string, path: string, extension: string };
class Episode {
    constructor(episodeNum, file) {
        this.getNewEpisodeName = () => `E${this.episodeNum}${this.file.extension}`;
        this.getFullPath = () => this.file.path;
        this.episodeNum = episodeNum;
        this.file = file;
    }
}
exports.Episode = Episode;
