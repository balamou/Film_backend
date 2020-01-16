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

    async createOrUpdateSeries(series: SeriesType) {
        const query = `INSERT INTO series (language, folder, title, seasons, description, poster) 
        VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT (folder) DO UPDATE 
        SET title = excluded.title,
        seasons = excluded.seasons,
        description = excluded.description,
        poster = excluded.poster RETURNING *`;
        const result = await this.pool.query<SeriesType>(query,
        [series.language, series.folder, series.title, series.seasons, series.description?.substring(0, this.VARCHAR_LIMIT), series.poster]
        );

        return result.rows[0];
    }

    async createOrUpdateEpisode(episode: EpisodeType) {
        const query = `INSERT INTO EPISODES(SERIES_ID, SEASON_NUMBER, EPISODE_NUMBER, VIDEO_URL, DURATION, THUMBNAIL_URL, TITLE, PLOT) 
        VALUES($1,$2,$3,$4,$5,$6,$7,$8) 
        ON CONFLICT (SERIES_ID, SEASON_NUMBER, EPISODE_NUMBER) DO UPDATE 
        SET VIDEO_URL = excluded.VIDEO_URL,
        DURATION = excluded.DURATION,
        THUMBNAIL_URL = excluded.THUMBNAIL_URL,
        TITLE = excluded.TITLE,
        PLOT = excluded.PLOT RETURNING *`;
        const result = await this.pool.query<EpisodeType>(query, [
            episode.seriesId, episode.seasonNumber, episode.episodeNumber, episode.videoURL, episode.duration, episode.thumbnailURL, episode.title, episode.plot?.substring(0, this.VARCHAR_LIMIT)
        ]);

        return result.rows[0];
    }

    async createOrUpdateEpisodes(episodes: EpisodeType[]) {
        const {seriesIds, seasonNumbers, episodeNumbers, videoURLs, durations, thumbnailURLs, titles, plots} = this.destructureEpisodes(episodes);
        
        const query = `INSERT INTO EPISODES(SERIES_ID, SEASON_NUMBER, EPISODE_NUMBER, VIDEO_URL, DURATION, THUMBNAIL_URL, TITLE, PLOT) 
        SELECT * FROM UNNEST ($1::int[], $2::int[], $3::int[], $4::text[], $5::int[], $6::text[], $7::text[], $8::text[]) 
        ON CONFLICT (SERIES_ID, SEASON_NUMBER, EPISODE_NUMBER) DO UPDATE 
        SET VIDEO_URL = excluded.VIDEO_URL,
        DURATION = excluded.DURATION,
        THUMBNAIL_URL = excluded.THUMBNAIL_URL,
        TITLE = excluded.TITLE,
        PLOT = excluded.PLOT RETURNING *`;
        const result = await this.pool.query<EpisodeType>(query, [
            seriesIds, seasonNumbers, episodeNumbers, videoURLs, durations, thumbnailURLs, titles, plots
        ]);

        return result.rows[0];
    }

    private destructureEpisodes(episodes: EpisodeType[]) {
        const seriesIds: number[] = [];
        const seasonNumbers: number[] = [];
        const episodeNumbers: number[] = [];
        const videoURLs: string[] = [];
        const durations: number[] = [];
        const thumbnailURLs: (string | undefined)[] = [];
        const titles: (string | undefined)[] = [];
        const plots: (string | undefined)[] = [];

        episodes.forEach(ep => {
            seriesIds.push(ep.seriesId);
            seasonNumbers.push(ep.seasonNumber);
            episodeNumbers.push(ep.episodeNumber);
            videoURLs.push(ep.videoURL);
            durations.push(ep.duration);
            thumbnailURLs.push(ep.thumbnailURL);
            titles.push(ep.title);
            plots.push(ep.plot?.substring(0, this.VARCHAR_LIMIT));
        });

        return {
            seriesIds: seriesIds,
            seasonNumbers: seasonNumbers,
            episodeNumbers: episodeNumbers,
            videoURLs: videoURLs,
            durations: durations,
            thumbnailURLs: thumbnailURLs,
            titles: titles,
            plots: plots
        };
    }
}

export default CreationManager;
