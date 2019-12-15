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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const omdb_1 = require("../FilmScrapper/omdb");
const ffmpeg_1 = __importDefault(require("../Adapters/ffmpeg"));
class VideoInfo {
    constructor(season, episode, videoPath, title, plot, thumbnail, duration) {
        this.season = season;
        this.episode = episode;
        this.videoPath = videoPath;
        this.title = title;
        this.plot = plot;
        this.thumbnail = thumbnail;
        this.duration = duration;
    }
}
class VirtualTreeParser {
    constructor(fsEditor) {
        this.videoInfo = [];
        this.fsEditor = fsEditor;
    }
    insert(season, episode, videoPath, data) {
        const match = this.videoInfo.find(item => item.episode === episode && item.season === season);
        if (!match) {
            const newInfo = new VideoInfo(season, episode, videoPath, data.title, data.plot, data.thumbnail, data.duration);
            this.videoInfo.push(newInfo);
        }
        else {
            if (data.title)
                match.title = data.title;
            if (data.plot)
                match.plot = data.plot;
            if (data.thumbnail)
                match.thumbnail = data.thumbnail;
            if (data.duration)
                match.duration = data.duration;
        }
    }
    getSeriesInformation(seriesName, virtualTree) {
        return __awaiter(this, void 0, void 0, function* () {
            const fetcher = new omdb_1.SeriesFetcher();
            const seriesInfo = yield fetcher.fetchSeries(seriesName);
            yield virtualTree.asyncForEach((season, episode) => __awaiter(this, void 0, void 0, function* () {
                const seasonNum = season.seasonNum.toString();
                const episodeNum = episode.episodeNum.toString();
                try {
                    const episodeInfo = yield fetcher.fetchEpisode(seriesName, seasonNum, episodeNum);
                    this.insert(season.seasonNum, episode.episodeNum, episode.path, {
                        title: episodeInfo.title,
                        plot: episodeInfo.plot
                    });
                }
                catch (_a) {
                    // fallback model
                    console.log(`Error parsing for '${seriesName}' season ${seasonNum} episode ${episodeNum}`);
                }
            }));
        });
    }
    generateThumbnails(virtualTree) {
        const videoProcessor = new ffmpeg_1.default();
        virtualTree.forEach((season, episode) => {
            const path = season.path;
            if (!path)
                return console.log(`Error: season ${season.seasonNum} folder not defined`);
            const thumbnails = `${path}/thumbnails`;
            const thumbnail = `${path}/thumbnails/E${episode.episodeNum}.png`;
            this.fsEditor.makeDirectory(thumbnails);
            const thumbnailPath = videoProcessor.generateThumbnail(episode.path, thumbnail);
            const duration = videoProcessor.getDuration(episode.path);
            this.insert(season.seasonNum, episode.episodeNum, episode.path, {
                thumbnail: thumbnailPath,
                duration: duration
            });
        });
    }
}
exports.default = VirtualTreeParser;
