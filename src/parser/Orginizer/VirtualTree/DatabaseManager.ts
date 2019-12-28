import CreationManager from '../../../database/CreationManager';
import { SeriesData } from '../VirtualTree/VirtualTreeParser';

export default class DatabaseManager {

    // this method makes _commitToDB execute asynchronously
    commitToDB(path: string, seriesName: string, seriesData: SeriesData) {
        const synchronize = require('synchronized-promise');
        const syncCommitToDB = synchronize(this._commitToDB);

        syncCommitToDB(path, seriesName, seriesData);
    }

    async _commitToDB(path: string, seriesName: string, seriesData: SeriesData) {
        const cManager = new CreationManager();
        const { seriesInfo, episodesInfo } = seriesData;

        console.log(seriesInfo);
        const series = await cManager.createSeries({
            language: 'en', // TODO: add language
            folder: path,
            title: seriesInfo?.title ?? seriesName,
            seasons: seriesInfo?.totalSeasons ?? 0, // TODO: make it not optional
            description: seriesInfo?.plot?.substring(0, 250),
            poster: seriesInfo?.poster?.replace(/public\//, '')
        });

        for (const episodeInfo of episodesInfo) {
            const episode = await cManager.createEpisode({
                seriesId: series.id!,
                seasonNumber: episodeInfo.season,
                episodeNumber: episodeInfo.episode,
                videoURL: episodeInfo.videoPath.replace(/public\//, ''),
                duration: episodeInfo.duration ?? 10, // TODO: Fix duration
                thumbnailURL: episodeInfo.thumbnail?.replace(/public\//, ''),
                title: episodeInfo.title,
                plot: episodeInfo.plot?.substring(0, 250)
            });
        }

        await cManager.endConnection();
    }
}