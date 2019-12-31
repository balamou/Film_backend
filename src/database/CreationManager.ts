import DatabaseManager from './DatabaseManager';

export type SeriesType = {id?: number, language: string, folder: string, title: string, seasons?: number, description?: string, poster?: string};

export type EpisodeType = {id?: number, seriesId: number, seasonNumber: number, episodeNumber: number, videoURL: string, duration: number, thumbnailURL?: string, title?: string, plot?: string, stoppedAt?: number};

export type UserType = {id?: number, username: string};

export type MovieType = {id?: number, language: string, duration: number, videoURL: string, folder: string, title: string, description?: string, poster?: string};

class CreationManager extends DatabaseManager {

    private readonly VARCHAR_LIMIT = 250;

    async createUser(user: UserType) {
        const query ='INSERT INTO USERS(USERNAME) VALUES($1) RETURNING *';
        const result = await this.pool.query<UserType>(query, [user.username]);

        return result.rows[0];
    }

    async createSeries(series: SeriesType) {
        const query ='INSERT INTO SERIES(LANGUAGE, FOLDER, TITLE, SEASONS, DESCRIPTION, POSTER) VALUES($1,$2,$3,$4,$5,$6) RETURNING *';
        const result = await this.pool.query<SeriesType>(query,
        [series.language, series.folder, series.title, series.seasons, series.description?.substring(0, this.VARCHAR_LIMIT), series.poster]
        );

        return result.rows[0];
    }

    async createEpisode(episode: EpisodeType) {
        const query = 'INSERT INTO EPISODES(SERIES_ID, SEASON_NUMBER, EPISODE_NUMBER, VIDEO_URL, DURATION, THUMBNAIL_URL, TITLE, PLOT) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *';
        const result = await this.pool.query<EpisodeType>(query, [
            episode.seriesId, episode.seasonNumber, episode.episodeNumber, episode.videoURL, episode.duration, episode.thumbnailURL, episode.title, episode.plot?.substring(0, this.VARCHAR_LIMIT)
        ]);

        return result.rows[0];
    }

    async createMovie(movie: MovieType) {
        const query = 'INSERT INTO MOVIES(LANGUAGE, DURATION, VIDEO_URL, FOLDER, TITLE, DESCRIPTION, POSTER) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *';
        const result = await this.pool.query<MovieType>(query, [
            movie.language, movie.duration, movie.videoURL, movie.folder, movie.title, movie.description, movie.poster
        ]);

        return result.rows[0];
    }
}

export default CreationManager;
