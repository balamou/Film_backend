import DatabaseManager from './DatabaseManager';
import { SeriesType } from "./CreationManager";

class DatabaseFetcher extends DatabaseManager {

    async fetchSeries(start: number, quantity: number, language: string) {
        const result = await this.pool.query<SeriesType>('SELECT * FROM SERIES WHERE language=$1', [ language ]);

        return result.rows;
    }

}

export default DatabaseFetcher;