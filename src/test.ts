import { Pool, Client, QueryResult } from "pg";
import fs from "fs";
require("dotenv").config();

class DatabaseManager {
    private readonly DB_NAME: string;
    private readonly DB_USER: string;
    private readonly DB_HOST: string;
    private pool: Pool;

    constructor() {
        this.DB_NAME = process.env.DB_NAME as string;
        this.DB_USER = process.env.DB_USER as string;
        this.DB_HOST = process.env.DB_HOST as string;
        this.pool = this.createPool();
    }

    createPool(): Pool {
        return new Pool({
            user: this.DB_USER,
            host: this.DB_HOST,
            database: this.DB_NAME,
            port: 5432
        });
    }

    async dropTables() {
        const query = `
        DROP TABLE IF EXISTS viewed_episodes;
        DROP TABLE IF EXISTS viewed_movies;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS movies;
        DROP TABLE IF EXISTS episodes;
        DROP TABLE IF EXISTS series;
        `;

        const result = await this.pool.query(query);
        await this.pool.end();

        return result;
    }

    async executeQueryFrom(file: string): Promise<QueryResult<any>> {
        const query = await this.readFile(file);
        const result = await this.pool.query(query);
        return result;
    }

    private readFile(file: string) {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(file, "utf-8", (err, contents) => {
                if (err) reject(err);
                else resolve(contents);
            });
        });
    }

    async endConnection() {
        await this.pool.end(); // close connection
    }
}

const dbManager = new DatabaseManager();
dbManager
    .executeQueryFrom(__dirname + "/database.sql")
    .then(res => {
        if (!res.rows) return;

        res.rows.forEach(row => {
            console.log(row);
        });
    })
    .finally(() => dbManager.endConnection());

export default DatabaseManager;
