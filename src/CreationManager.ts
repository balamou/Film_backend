import DatabaseManager from './test';

type SeriesType = {id?: number, language: string, folder: string, title: string, seasons: number, description?: string, poster?: string};

type EpisodeType = {id?: number, seriesId: number, episodeNumber: number, seasonNumber: number, videoURL: string, duration: number, thumbnailURL?: string, title?: string, plot?: string};

class CreationManager extends DatabaseManager {

    constructor() {
        super();
    }

    async createSeries(series: SeriesType) {
        const query ='INSERT INTO SERIES(LANGUAGE, FOLDER, TITLE, SEASONS, DESCRIPTION, POSTER) VALUES($1,$2,$3,$4,$5,$6) RETURNING *';
        const result = await this.pool.query<SeriesType>(query,
        [series.language, series.folder, series.title, series.seasons, series.description, series.poster]
        );

        return result;
    }

    async createEpisode(episode: EpisodeType) {
        const query = 'INSERT INTO EPISODES(SERIES_ID, EPISODE_NUMBER, SEASON_NUMBER, VIDEO_URL, DURATION, THUMBNAIL_URL, TITLE, PLOT) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *';
        const result = await this.pool.query<EpisodeType>(query, [
            episode.seriesId, episode.seasonNumber, episode.seasonNumber, episode.videoURL, episode.duration, episode.thumbnailURL, episode.title, episode.plot
        ]);

        return result;
    }

}

async function test() {
    const cManager = new CreationManager();

    const series = await cManager.createSeries({
        language: "en",
        folder: "hehe",
        title: "rick_and_morty",
        seasons: 2
    });

    const seriesId = series.rows[0].id;
    if (!seriesId) return;

    const episode = await cManager.createEpisode({seriesId: seriesId, episodeNumber: 1, seasonNumber: 2, videoURL: "hehe", duration: 12});
    
    cManager.endConnection();
}

test();

export default CreationManager;
