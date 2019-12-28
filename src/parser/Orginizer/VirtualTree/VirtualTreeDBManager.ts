import CreationManager from '../../../database/CreationManager';
import { SeriesData } from './VirtualTreeParser';

export default class VirtualTreeDBManager {
    private readonly language: string; // 'en' or 'ru'

    constructor(language: string) {
        this.language = language;
    }

    /**
     * Commits `seriesData` to the database. 
     * 
     * @param path to the series. It is stored in the database in the `folder` column
     * @param seriesName an optional series name fall back if `seriesData` did not get the title of the series
     * 
     * `Note:` This method forces `_commitToDB` to execute synchronously
    */
    commitToDB(path: string, seriesName: string, seriesData: SeriesData) {
        const synchronize = require('synchronized-promise');
        const syncCommitToDB = synchronize(this._commitToDB);

        syncCommitToDB(path, seriesName, seriesData, this.language);
    }

    private async _commitToDB(path: string, seriesName: string, seriesData: SeriesData, language: string) {
        const cManager = new CreationManager();
        const { seriesInfo, episodesInfo } = seriesData;
        const staticDirectory = /public\//;

        const series = await cManager.createSeries({
            language: language,
            folder: path,
            title: seriesInfo?.title ?? seriesName,
            seasons: seriesInfo?.totalSeasons,
            description: seriesInfo?.plot?.substring(0, 250),
            poster: seriesInfo?.poster?.replace(staticDirectory, '')
        });

        for (const episodeInfo of episodesInfo) {
            if (!episodeInfo.duration) continue;

            const episode = await cManager.createEpisode({
                seriesId: series.id!,
                seasonNumber: episodeInfo.season,
                episodeNumber: episodeInfo.episode,
                videoURL: episodeInfo.videoPath.replace(staticDirectory, ''),
                duration: episodeInfo.duration,
                thumbnailURL: episodeInfo.thumbnail?.replace(staticDirectory, ''),
                title: episodeInfo.title,
                plot: episodeInfo.plot?.substring(0, 250)
            });
        }

        await cManager.endConnection();
    }
}