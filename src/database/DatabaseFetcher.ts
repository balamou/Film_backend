import DatabaseManager from './DatabaseManager';
import { SeriesType, EpisodeType } from "./CreationManager";

type Episode_Type = {id?: number, series_id: number, season_number: number, episode_number: number, video_url: string, duration: number, thumbnail_url?: string, title?: string, plot?: string};

class DatabaseFetcher extends DatabaseManager {

    async fetchSeries(start: number, quantity: number, language: string) {
        const result = await this.pool.query<SeriesType>('SELECT * FROM SERIES WHERE language=$1', [ language ]);

        return result.rows;
    }

    async getSeriesById(seriesId: number) {
        const result = await this.pool.query<SeriesType>('SELECT * FROM SERIES WHERE id=$1', [ seriesId ]);

        return result.rows[0];
    }

    // TODO: return actual stopped at
    async getEpisodesFromSeriesIdWithStoppedAt(seriesId: number, season: number, userId: number): Promise<EpisodeType[]> {        
        const result = await this.pool.query<Episode_Type>('SELECT * FROM EPISODES WHERE SERIES_ID=$1 AND SEASON_NUMBER=$2 ORDER BY EPISODE_NUMBER ASC', [ seriesId, season ]);

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
            plot: episode.plot
        };
    }

    async getAvailableSeasons(seriesId: number) {
        const result = await this.pool.query<{season_number: number}>('SELECT DISTINCT SEASON_NUMBER FROM EPISODES WHERE series_id=$1', [ seriesId ]);
        
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
}

export default DatabaseFetcher;