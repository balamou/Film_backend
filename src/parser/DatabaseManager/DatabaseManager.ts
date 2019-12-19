
import CreationManager from '../../database/CreationManager';
import { SeriesData } from '../VirtualTree/VirtualTreeParser';

export default class DatabaseManager {

    commitToDB(path: string, seriesName: string, seriesInfo: SeriesData) {
        // this method makes _commitToDB execute asynchronously
        const synchronize = require('synchronized-promise');
        const syncCommitToDB = synchronize(this._commitToDB);

        syncCommitToDB(path, seriesName, seriesInfo);
    }

    async _commitToDB(path: string, seriesName: string, seriesInfo: SeriesData) {
        const cManager = new CreationManager();

        const series = await cManager.createSeries({
            language: 'en', // TODO: add language
            folder: path,
            title: seriesInfo.seriesInfo?.title ?? seriesName,
            seasons: seriesInfo.seriesInfo?.totalSeasons ?? 0, // TODO: make it not optional
            description: seriesInfo.seriesInfo?.plot,
            poster: seriesInfo.seriesInfo?.poster?.replace(/public\//, '')
        });

        if (!series.id) throw new Error(`Series '${seriesName}' has an unspecified 'seriesId'`);

        for (const videoInfo of seriesInfo.videoInfo) {
            const episode = await cManager.createEpisode({
                seriesId: series.id,
                seasonNumber: videoInfo.season,
                episodeNumber: videoInfo.episode,
                videoURL: videoInfo.videoPath.replace(/public\//, ''),
                duration: videoInfo.duration ?? 10, // TODO: Fix duration
                thumbnailURL: videoInfo.thumbnail?.replace(/public\//, ''),
                title: videoInfo.title,
                plot: videoInfo.plot
            });
        }

        await cManager.endConnection();
    }
}