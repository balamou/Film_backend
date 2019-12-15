import { VirtualTree } from './VirtualTree';
import { SeriesFetcher } from '../FilmScrapper/omdb';
import { FileSystemEditor } from '../Adapters/FSEditor';
import { download } from '../Adapters/HTTPReq';

import ffmpeg from '../Adapters/ffmpeg';

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

export class VirtualTreeParser {
    videoInfo: VideoInfo[] = [];
    seriesInformation?: { title?: string, poster?: string, plot?: string, totalSeasons?: number };
    private fsEditor: FileSystemEditor;

    constructor(fsEditor: FileSystemEditor) {
        this.fsEditor = fsEditor;
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

    private async getSeriesInfo(path: string, seriesName: string) {
        const fetcher = new SeriesFetcher();

        try {
            const seriesData = await fetcher.fetchSeries(seriesName);
            let fullPosterName: string | undefined;

            try {
                fullPosterName = await download(seriesData.poster, `${path}/poster`);
            } catch {
                console.log(`Unable to download poster image for ${seriesName}`);
            }

            this.seriesInformation = {
                title: seriesData.title,
                plot: seriesData.plot,
                poster: fullPosterName,
                totalSeasons: seriesData.totalSeasons
            };
        } catch {
            console.log(`Error parsing series info '${seriesName}'`);
        }
    }

    async getSeriesInformation(path: string, seriesName: string, virtualTree: VirtualTree) {
        const fetcher = new SeriesFetcher();
        
        await this.getSeriesInfo(path, seriesName);

        await virtualTree.asyncForEach(async (season, episode) => {
            const seasonNum = season.seasonNum.toString();
            const episodeNum = episode.episodeNum.toString();

            try {
                const episodeInfo = await fetcher.fetchEpisode(seriesName, seasonNum, episodeNum);

                this.insert(season.seasonNum, episode.episodeNum, episode.path, {
                    title: episodeInfo.title,
                    plot: episodeInfo.plot
                });
            } catch {
                console.log(`Error parsing for '${seriesName}' season ${seasonNum} episode ${episodeNum}`);
            }
        });
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
