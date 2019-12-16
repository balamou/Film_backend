"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../util/database"));
class Series extends sequelize_1.Model {
}
Series.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    language: {
        type: new sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'en',
        validate: {
            isIn: [['en', 'ru']]
        }
    },
    folder: {
        type: new sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: new sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    seasons: {
        type: new sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    desc: {
        type: new sequelize_1.DataTypes.STRING(250),
        allowNull: true,
        set(value) {
            this.setDataValue('desc', value.substring(0, 250)); // work-around
        }
    },
    poster: {
        type: new sequelize_1.DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'series',
    sequelize: database_1.default,
});
// const notNullString = {
//     type: Sequelize.STRING,
//     allowNull: false
// }
// const Series = sequelize.define('series', {
//     language: {
//         type: Sequelize.STRING,
//         allowNull: false,
//         defaultValue: 'en',
//         validate: {
//             isIn: [['en', 'ru']]
//         }
//     },
//     // the location of the top level series folder in public.
//     // example: /en/shows/rick_and_morty/
//     folder: notNullString,
//     title: notNullString,
//     seasons: { // total seasons as parsed from imdb
//         type: Sequelize.INTEGER,
//         allowNull: false
//     },
//     desc: Sequelize.STRING, 
//     poster: Sequelize.STRING
// });
exports.default = Series;
