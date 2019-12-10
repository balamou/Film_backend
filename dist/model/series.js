"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const database_1 = __importDefault(require("../util/database"));
const notNullString = {
    type: sequelize_1.default.STRING,
    allowNull: false
};
const Series = database_1.default.define('series', {
    language: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        defaultValue: 'en',
        validate: {
            isIn: [['en', 'ru']]
        }
    },
    // the location of the top level series folder in public.
    // example: /en/shows/rick_and_morty/
    folder: notNullString,
    title: notNullString,
    seasons: {
        type: sequelize_1.default.INTEGER,
        allowNull: false
    },
    desc: sequelize_1.default.STRING,
    poster: sequelize_1.default.STRING
});
exports.default = Series;
