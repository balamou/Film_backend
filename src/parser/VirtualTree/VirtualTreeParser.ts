import { VirtualTree } from './VirtualTree';
import Fetcher from '../FilmScrapper/fetcher';
import { FileSystemEditor } from '../Adapters/FSEditor';

import ffmpeg from '../Adapters/ffmpeg';
import { download } from '../Adapters/HTTPReq';

class VideoInfo {
    season: number;
    episode: number;
    videoPath: string;

    title?: string;
    plot?: string;
    thumbnail?: string;
    duration?: number;

    constructor(season: number,
        episode: number,
        videoPath: string,
        title?: string | undefined,
        plot?: string | undefined,
        thumbnail?: string | undefined,
        duration?: number | undefined) {
        this.season = season;
        this.episode = episode;
        this.videoPath = videoPath;

        this.title = title;
        this.plot = plot;
        this.thumbnail = thumbnail;
        this.duration = duration;
    }
}

export type SeriesData = {
    seriesInfo: {
        title?: string | undefined;
        poster?: string | undefined;
        plot?: string | undefined;
        totalSeasons?: number | undefined;
    } | undefined;
    videoInfo: VideoInfo[];
};

export class VirtualTreeParser {
    videoInfo: VideoInfo[] = [];
    seriesInfo?: { title?: string, poster?: string, plot?: string, totalSeasons?: number };

    private fsEditor: FileSystemEditor;
    private fetcher: Fetcher;

    constructor(fsEditor: FileSystemEditor, fetcher: Fetcher) {
        this.fsEditor = fsEditor;
        this.fetcher = fetcher;
    }

    insert(season: number, episode: number, videoPath: string,
        data: { title?: string, plot?: string, thumbnail?: string, duration?: number }) {
        const match = this.videoInfo.find(item => item.episode === episode && item.season === season);

        if (!match) {
            const newInfo = new VideoInfo(season, episode, videoPath, data.title, data.plot, data.thumbnail, data.duration);
            this.videoInfo.push(newInfo);
        } else {
            if (data.title) match.title = data.title;
            if (data.plot) match.plot = data.plot;
            if (data.thumbnail) match.thumbnail = data.thumbnail;
            if (data.duration) match.duration = data.duration;
        }
    }

    private getSeriesInfo(path: string, seriesName: string) {
        try {
            const seriesData = this.fetcher.fetchSeries(seriesName);
            let fullPosterName: string | undefined;

            if (seriesData.poster) {
                try {
                    fullPosterName = download(seriesData.poster, `${path}/poster`);
                } catch {
                    console.log(`Unable to download poster image for ${seriesName}`);
                }
            }

            this.seriesInfo = {
                title: seriesData.title,
                plot: seriesData.plot,
                poster: fullPosterName,
                totalSeasons: seriesData.totalSeasons
            };
        } catch {
            console.log(`Error parsing series info '${seriesName}'`);
        }
    }

    getSeriesInformation(path: string, seriesName: string, virtualTree: VirtualTree): SeriesData {
        this.getSeriesInfo(path, seriesName);

        virtualTree.forEach((season, episode) => {
            const seasonNum = season.seasonNum;
            const episodeNum = episode.episodeNum;

            try {
                const episodeInfo = this.fetcher.fetchEpisode(seriesName, seasonNum, episodeNum);

                this.insert(season.seasonNum, episode.episodeNum, episode.path, {
                    title: episodeInfo.title,
                    plot: episodeInfo.plot
                });
            } catch {
                console.log(`Error parsing for '${seriesName}' season ${seasonNum} episode ${episodeNum}`);
            }
        });

        return { seriesInfo: this.seriesInfo, videoInfo: this.videoInfo };
    }

    generateThumbnails(virtualTree: VirtualTree) {
        const videoProcessor = new ffmpeg();

        virtualTree.forEach((season, episode) => {
            const path = season.path;
            if (!path) return console.log(`Error: season ${season.seasonNum} folder not defined`);

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
