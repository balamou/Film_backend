import { VirtualTree } from './VirtualTree';
import Fetcher from '../../FilmScrapper/fetcher';
import { FileSystemEditor } from '../../Adapters/FSEditor';

import ffmpeg from '../../Adapters/ffmpeg';
import { download } from '../../Adapters/HTTPReq';

class EpisodeInfo{
    constructor(public season: number,
        public episode: number,
        public videoPath: string,
        public title?: string,
        public plot?: string,
        public thumbnail?: string,
        public duration?: number) {
    }
}

class SeriesInfo {
    constructor(public title?: string | undefined,
        public poster?: string | undefined,
        public plot?: string | undefined,
        public totalSeasons?: number | undefined) {
    }
}

export class SeriesData {
    seriesInfo?: SeriesInfo;
    episodesInfo: EpisodeInfo[] = [];

    constructor(seriesInfo?: SeriesInfo) {
        this.seriesInfo = seriesInfo
    }

    addSeriesInfo(title?: string, poster?: string, plot?: string, totalSeasons?: number) {
        this.seriesInfo = new SeriesInfo(title, poster, plot, totalSeasons);
    }

    insert(season: number, episode: number, videoPath: string, data: { title?: string, plot?: string, thumbnail?: string, duration?: number }) {
        const match = this.episodesInfo.find(item => item.episode === episode && item.season === season);

        if (!match) {
            const newInfo = new EpisodeInfo(season, episode, videoPath, data.title, data.plot, data.thumbnail, data.duration);
            this.episodesInfo.push(newInfo);
        } else {
            if (data.title) match.title = data.title;
            if (data.plot) match.plot = data.plot;
            if (data.thumbnail) match.thumbnail = data.thumbnail;
            if (data.duration) match.duration = data.duration;
        }
    }
};

export class VirtualTreeParser {
    seriesData: SeriesData = new SeriesData();

    private fsEditor: FileSystemEditor;
    private fetcher: Fetcher;

    constructor(fsEditor: FileSystemEditor, fetcher: Fetcher) {
        this.fsEditor = fsEditor;
        this.fetcher = fetcher;
    }

    private getSeriesInfo(path: string, seriesName: string) {
        try {
            const { title, plot, poster, totalSeasons } = this.fetcher.fetchSeries(seriesName);
            let fullPosterName: string | undefined;

            if (poster) {
                try {
                    fullPosterName = download(poster, `${path}/poster`);
                } catch {
                    console.log(`Unable to download poster image for ${seriesName}`);
                }
            }

            this.seriesData.addSeriesInfo(title, fullPosterName, plot, totalSeasons);
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
                const { title, plot } = this.fetcher.fetchEpisode(seriesName, seasonNum, episodeNum);

                this.seriesData.insert(seasonNum, episodeNum, episode.path, {
                    title: title,
                    plot: plot
                });
            } catch {
                console.log(`Error parsing for '${seriesName}' season ${seasonNum} episode ${episodeNum}`);
            }
        });

        return this.seriesData;
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

            this.seriesData.insert(season.seasonNum, episode.episodeNum, episode.path, {
                thumbnail: thumbnailPath,
                duration: duration
            });
        });
    }
}   
