import { VirtualTree } from './VirtualTree';
import { SeriesFetcher } from '../FilmScrapper/omdb';

export default class VirtualTreeOmdb {

    async findInformation(seriesName: string, virtualTree: VirtualTree) {
        const fetcher = new SeriesFetcher();

        const seriesInfo = await fetcher.fetchSeries(seriesName);
        const episodeData: {title?: string, plot?: string}[] = [];

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
}   
