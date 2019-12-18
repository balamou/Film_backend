import { Sequelize } from 'sequelize';
require('dotenv').config();

console.log();

const DB_NAME = process.env.DB_NAME as string;
const DB_USER = process.env.DB_USER as string;
const DB_HOST = process.env.DB_HOST as string;

const sequelize = new Sequelize(DB_NAME, DB_USER, '', {
    host: DB_HOST,
    dialect: 'postgres'
});

export default sequelize;
