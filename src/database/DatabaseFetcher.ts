import DatabaseManager from './DatabaseManager';
import { SeriesType, EpisodeType } from "./CreationManager";

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
        type Episode_Type = {id?: number, series_id: number, season_number: number, episode_number: number, video_url: string, duration: number, thumbnail_url?: string, title?: string, plot?: string};
        
        const result = await this.pool.query<Episode_Type>('SELECT * FROM EPISODES WHERE SERIES_ID=$1 AND SEASON_NUMBER=$2 ORDER BY EPISODE_NUMBER ASC', [ seriesId, season ]);

        return result.rows.map(row => {
            return {
                id: row.id,
                seriesId: row.series_id,
                seasonNumber: row.season_number,
                episodeNumber: row.episode_number,
                videoURL: row.video_url,
                duration: row.duration,
                thumbnailURL: row.thumbnail_url,
                title: row.title,
                plot: row.plot
            };
        });
    }

    async getAvailableSeasons(seriesId: number) {
        const result = await this.pool.query<{season_number: number}>('SELECT DISTINCT SEASON_NUMBER FROM EPISODES WHERE series_id=$1', [ seriesId ]);
        
        return result.rows.map(row => row.season_number);
    }

    async getLastWatchedEpisode(seriesId: number, userId: number){
        return {
            id: 1,
            episodeNumber: 1,
            seasonNumber: 1,
            videoURL: "en/shows/rick_and_morty",
            duration: 1290
        };
    }
}

export default DatabaseFetcher;