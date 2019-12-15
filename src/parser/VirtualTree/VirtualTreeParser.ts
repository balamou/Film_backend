import { VirtualTree, Episode } from './VirtualTree';
import { SeriesFetcher } from '../FilmScrapper/omdb';

import ffmpeg from '../Adapters/ffmpeg';
import { FSEditor } from '../Adapters/FSEditor';

export default class VirtualTreeParser {

    async findInformation(seriesName: string, virtualTree: VirtualTree) {
        const fetcher = new SeriesFetcher();

        const seriesInfo = await fetcher.fetchSeries(seriesName);
        const episodeData: { title?: string, plot?: string }[] = [];

        await virtualTree.asyncForEach(async (season, episode) => {
            const seasonNum = season.seasonNum.toString();
            const episodeNum = episode.episodeNum.toString();

            try {
                const episodeInfo = await fetcher.fetchEpisode(seriesName, seasonNum, episodeNum);

                episodeData.push({
                    title: episodeInfo.title,
                    plot: episodeInfo.plot
                });
            } catch {
                // fallback model
                console.log(`Error parsing for '${seriesName}' season ${seasonNum} episode ${episodeNum}`);
            }
        });

        return {
            seriesInfo: seriesInfo,
            episodeData: episodeData
        };
    }

    generateThumbnails(virtualTree: VirtualTree) {
        const videoProcessor = new ffmpeg();
        const fsEditor = new FSEditor();

        virtualTree.forEach((season, episode) => {
            const path = season.path;
            if (!path) return console.log(`Error: season ${season.seasonNum} folder not defined`);

            const thumbnails = `${path}/thumbnails`;
            const thumbnail = `${path}/thumbnails/${episode.episodeNum}.png`;

            fsEditor.makeDirectory(thumbnails);
            videoProcessor.generateThumbnail(episode.path, thumbnail);
            const duration = videoProcessor.getDuration(episode.path);

            const episodeData = {
                videoPath: episode.path,
                thumbnail: thumbnail,
                duration: duration
            };
        });
    }
}   
