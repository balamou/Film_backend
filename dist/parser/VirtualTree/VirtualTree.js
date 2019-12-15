"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    asyncForEach(apply) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let season of this.tree) {
                for (let episode of season.episodes) {
                    yield apply(season, episode);
                }
            }
        });
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
class Episode {
    constructor(episodeNum, file) {
        this.getNewEpisodeName = () => `E${this.episodeNum}${this.file.extension}`;
        this.getFullPath = () => this.file.path;
        this.episodeNum = episodeNum;
        this.file = file;
    }
}
exports.Episode = Episode;
