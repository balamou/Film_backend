
import Episode from '../../model/episode';
import Series from '../../model/series';
import { SeriesData } from '../VirtualTree/VirtualTreeParser';

export default class DatabaseManager {

    commitToDB(path: string, seriesName: string, seriesInfo: SeriesData) {
        // this method makes _commitToDB execute asynchronously
        const sp = require('synchronized-promise');
        const syncCommitToDB = sp(this._commitToDB);

        syncCommitToDB(path, seriesName, seriesInfo);
    }

    async _commitToDB(path: string, seriesName: string, seriesInfo: SeriesData) {
        // nil coalescing and optional chaining will be marked as an error
        // but it can be safely ignored
        await Series.create({
            language: 'en',
            folder: path,
            title: seriesInfo.seriesInfo ?.title ?? seriesName,
            seasons: seriesInfo.seriesInfo ?.totalSeasons,
            desc: seriesInfo.seriesInfo ?.plot,
            poster: seriesInfo.seriesInfo ?.poster
        });

        for (const videoInfo of seriesInfo.videoInfo) {
            await Episode.create({
                episodeNumber: videoInfo.episode,
                seasonNumber: videoInfo.season,
                videoURL: videoInfo.videoPath,
                duration: videoInfo.duration ?? 10, // TODO: Fix
                thumbnailURL: videoInfo.thumbnail,
                title: videoInfo.title,
                plot: videoInfo.plot
            }, { logging: false });
        }
    }
}