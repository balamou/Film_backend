"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../util/database"));
class Episode extends sequelize_1.Model {
}
Episode.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    episodeNumber: {
        type: new sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    seasonNumber: {
        type: new sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    videoURL: {
        type: new sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    duration: {
        type: new sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    thumbnailURL: {
        type: new sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    title: {
        type: new sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    plot: {
        type: new sequelize_1.DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'episodes',
    sequelize: database_1.default,
});
// const EpisodeTMP = sequelize.define('episodes', {
//     episodeNumber: { type: Sequelize.INTEGER, allowNull: false },
//     seasonNumber: { type: Sequelize.INTEGER, allowNull: false },
//     videoURL: { type: Sequelize.STRING, allowNull: false },
//     duration: Sequelize.INTEGER,
//     thumbnailURL: { type: Sequelize.STRING, allowNull: true },
//     title: { type: Sequelize.STRING, allowNull: true },
//     plot: { type: Sequelize.STRING, allowNull: true }
// });
exports.default = Episode;
