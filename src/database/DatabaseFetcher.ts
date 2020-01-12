import DatabaseManager from './DatabaseManager';
import { SeriesType, EpisodeType, UserType } from "./CreationManager";

type Episode_Type = {id?: number, series_id: number, season_number: number, episode_number: number, video_url: string, duration: number, thumbnail_url?: string, title?: string, plot?: string, stopped_at?: number};

class DatabaseFetcher extends DatabaseManager {

    async fetchSeries(start: number, quantity: number, language: string) { // TODO: add pagination support
        const result = await this.pool.query<SeriesType>('SELECT * FROM SERIES WHERE language=$1', [ language ]);

        return result.rows;
    }

    async fetchMovies(start: number, quantity: number, language: string) { // TODO: add pagination support
        const result = await this.pool.query<{id: number, poster?: string}>('SELECT ID, POSTER FROM MOVIES WHERE language=$1', [ language ]);

        return result.rows;
    }

    async getSeriesById(seriesId: number) {
        const result = await this.pool.query<SeriesType>('SELECT * FROM SERIES WHERE id=$1', [ seriesId ]);

        return result.rows[0];
    }
    
    /**
     * Returns movie information with the last watched timestamp if available.
     * 
     * @param movieId movie id 
     * @param userId user id is used to retrieve where last watched
     */
    async getMovieById(movieId: number, userId: number) {
        const query = `SELECT MOVIES.*, T.STOPPED_AT 
        FROM MOVIES 
        LEFT JOIN
            (SELECT *
            FROM VIEWED_MOVIES as VM
            WHERE VM.USER_ID = $2) as T
        ON MOVIES.ID = T.MOVIE_ID
        WHERE MOVIES.ID = $1;`;
        const result = await this.pool.query<{id: number, duration: number, video_url: string, title: string, description?: string, poster?: string, stopped_at?: number}>(query, [ movieId, userId ]);

        return result.rows[0];
    }

    // TODO: return actual stopped at
    async getEpisodesFromSeriesIdWithStoppedAt(seriesId: number, season: number, userId: number): Promise<EpisodeType[]> {        
        const query = `SELECT EP.*, T.stopped_at
        FROM EPISODES as EP
        LEFT JOIN
            (SELECT *
            FROM VIEWED_EPISODES as VE
            WHERE VE.USER_ID=$1) as T
        ON EP.ID = T.EPISODE_ID
        WHERE
        EP.SERIES_ID=$2 AND EP.SEASON_NUMBER=$3 
        ORDER BY EP.EPISODE_NUMBER;`;
        const result = await this.pool.query<Episode_Type>(query, [ userId, seriesId, season ]);

        return result.rows.map(row => {
            return this.convertToEpisodeType(row);
        });
    }

    async getEpisodesFromSeason(seriesId: number, season: number): Promise<EpisodeType[]> {        
        const query = "SELECT * FROM episodes WHERE series_id=$1 AND season_number=$2 ORDER BY episode_number";
        const result = await this.pool.query<Episode_Type>(query, [seriesId, season]);

        return result.rows.map(row => {
            return this.convertToEpisodeType(row);
        });
    }

    private convertToEpisodeType(episode: Episode_Type): EpisodeType {
        return {
            id: episode.id,
            seriesId: episode.series_id,
            seasonNumber: episode.season_number,
            episodeNumber: episode.episode_number,
            videoURL: episode.video_url,
            duration: episode.duration,
            thumbnailURL: episode.thumbnail_url,
            title: episode.title,
            plot: episode.plot,
            stoppedAt: episode.stopped_at 
        };
    }

    async getAvailableSeasons(seriesId: number) {
        const result = await this.pool.query<{season_number: number}>('SELECT DISTINCT SEASON_NUMBER FROM EPISODES WHERE series_id=$1 ORDER BY SEASON_NUMBER ASC', [ seriesId ]);
        
        return result.rows.map(row => row.season_number);
    }

    // Gets last watched episode of the series
    // If null then gets the earliest episode available (lowest season number and episode number)
    async getLastWatchedEpisode(seriesId: number, userId: number){
        const query = `SELECT EP.*, VEE.stopped_at
        FROM EPISODES as EP, VIEWED_EPISODES as VEE,
        (WITH EPISODES_FROM_SERIES AS (SELECT id FROM EPISODES WHERE series_id = $1)
        SELECT max(VE.date_viewed) as max_date 
        FROM VIEWED_EPISODES as VE
        WHERE VE.episode_id IN (SELECT ID FROM EPISODES_FROM_SERIES) AND VE.user_id = $2
        ) as T 
        WHERE VEE.episode_id = EP.id AND VEE.date_viewed = T.max_date AND VEE.user_id = $2;`;

        const result = await this.pool.query<Episode_Type>(query, [ seriesId, userId ]);

        if (result.rows.length > 0) {
            return this.convertToEpisodeType(result.rows[0]);
        } else {
            return await this.getFirstEpisode(seriesId);
        }
    }

    async getFirstEpisode(seriesId: number) {
        let query = `DROP TABLE IF EXISTS FIRST_EPISODE;`;
        await this.pool.query(query);

        query = `CREATE TEMP TABLE FIRST_EPISODE AS SELECT A.min_season, B.min_episode FROM
        (SELECT min(season_number) as min_season
        FROM EPISODES 
        WHERE series_id = $1) as A,
        (SELECT min(episode_number) as min_episode FROM
        episodes,
        (SELECT min(season_number) as min_season
        FROM EPISODES 
        WHERE series_id = $1) as T
        WHERE series_id = $1 AND season_number = T.min_season) as B;`
        await this.pool.query(query, [ seriesId ]);
        
        query = `SELECT * FROM EPISODES, FIRST_EPISODE WHERE series_id = $1 AND season_number = FIRST_EPISODE.min_season AND episode_number = FIRST_EPISODE.min_episode;`;
        const result = await this.pool.query<Episode_Type>(query, [ seriesId ]);

        return this.convertToEpisodeType(result.rows[0]); // TODO: throw error if empty
    }

    async getUser(username: string) {
        const user = await this.pool.query<UserType>('SELECT * FROM USERS WHERE USERNAME=$1', [ username ]);

        if (user.rowCount > 0) return user.rows[0];

        throw new Error('Username does not exist');
    }

    async getSeriesIdFromFolder(seriesFolder: string) {
        const series_id = await this.pool.query<{id: number}>('SELECT id FROM SERIES WHERE FOLDER=$1', [ seriesFolder ]);

        if (series_id.rowCount > 0) return series_id.rows[0].id;

        return undefined;
    }

    async getNextEpisodeFrom(currentEpisodeId: number, userId: number) {
        type CurrEpisode = { series_id: number, season_number: number, episode_number: number };
        type Film = {
            id: number,
            episode_number: number,
            season_number: number,
            video_url: string,
            duration: number,
            stopped_at?: number,
            title?: string
        };
        const result = await this.pool.query<CurrEpisode>('SELECT series_id, season_number, episode_number FROM EPISODES WHERE ID = $1', [ currentEpisodeId ]);
        if (result.rowCount == 0) return;
        const episode = result.rows[0];

        //get next episode in `THIS` season
        let query = 'SELECT id, episode_number, season_number, video_url, duration, title FROM episodes WHERE series_id = $1 AND season_number = $2 AND episode_number > $3 LIMIT 1';
        const result2 = await this.pool.query<Film>(query, [ episode.series_id, episode.season_number, episode.episode_number ]);
        
        if (result2.rowCount != 0) {
            return result2.rows[0];
        }

        // get next episode in `Next available` season 
        query = 'SELECT id, episode_number, season_number, video_url, duration, title FROM episodes WHERE series_id = $1 AND season_number > $2 ORDER BY season_number, episode_number LIMIT 1';
        const result3 = await this.pool.query<Film>(query, [ episode.series_id, episode.season_number ]);
        
        if (result3.rowCount != 0) {
            return result3.rows[0];
        }
    }

    async getEpisodeTimestamps(episodeId: number) {
        type EpisodeTimestamp = {
            name: string,
            type: string,
            from_time: number,
            to_time?: number,
        }

        let query = 'SELECT * FROM episode_timestamps WHERE episode_id = $1';
        const result = await this.pool.query<EpisodeTimestamp>(query, [ episodeId ]);
        
        return result.rows;
    }

    async getMovieInformation(movieId: number) {
        let query = "SELECT id, title, video_url, duration FROM movies WHERE id = $1";
        const result = await this.pool.query<{id: number, title: string, video_url: string, duration: number}>(query, [ movieId ]);

        return result.rows[0];
    }

    async getEpisodeInformation(episodeId: number) {
        type EpisodeInfo = {id: number, series_id: number, title: string, show_title: string, video_url: string, duration: number, season_number: number, episode_number: number};

        let query = `SELECT E.*, T.title as show_title
        from episodes as E, (SELECT id, title from series) as T
        WHERE E.series_id = T.id and E.id = $1`;
        const result = await this.pool.query<EpisodeInfo>(query, [ episodeId ]);

        return result.rows[0];
    }

    async getMoviePosters(movieIDs: number[]) {
        let query = "SELECT id, poster FROM movies WHERE id = ANY ($1)";
        const result = await this.pool.query<{id: number, poster: string}>(query, [ movieIDs ]);

        return result.rows;
    }

    async getShowPosters(showIDs: number[]) {
        let query = "SELECT id, poster FROM series WHERE id = ANY ($1)";
        const result = await this.pool.query<{id: number, poster: string}>(query, [ showIDs ]);

        return result.rows;
    }
}

export default DatabaseFetcher;