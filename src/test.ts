import { Pool, Client } from "pg";
import fs from "fs";
require("dotenv").config();

const DB_NAME = process.env.DB_NAME as string;
const DB_USER = process.env.DB_USER as string;
const DB_HOST = process.env.DB_HOST as string;

const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    port: 5432
});

async function dropTables() {
    const query = `
    DROP TABLE IF EXISTS viewed_episodes;
    DROP TABLE IF EXISTS viewed_movies;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS movies;
    DROP TABLE IF EXISTS episodes;
    DROP TABLE IF EXISTS series;
    `;

    try {
        const result = await pool.query(query);
        await pool.end();

        console.log(result);
    } catch (error) {
        console.log(error);
    }
}

async function executeQueryFrom(file: string) {
    try {
        const query = await readFile(file);
        const result = await pool.query(query);
        await pool.end(); // close connection

        console.log(result);
    } catch (error) {
        console.log(error);
    }
}

function readFile(file: string) {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(file, "utf-8", (err, contents) => {
            if (err) reject(err);
            else resolve(contents);
        });
    });
}

executeQueryFrom(__dirname + "/database.sql");

export default pool;
