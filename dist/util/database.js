"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
require('dotenv').config();
console.log();
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_HOST = process.env.DB_HOST;
const sequelize = new sequelize_1.Sequelize(DB_NAME, DB_USER, '', {
    host: DB_HOST,
    dialect: 'postgres'
});
exports.default = sequelize;
