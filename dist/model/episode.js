"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const database_1 = __importDefault(require("../util/database"));
// export interface EpisodeAttributes {
//     id?: number;
//     episodeNumber: number;
//     seasonNumber: number;
//     videoURL: string;
//     duration: number;
//     thumbnailURL?: string;
//     title?: string;
//     plot?: string;
//     createdAt?: Date;
//     updatedAt?: Date;
// }
const Episode = database_1.default.define('episodes', {
    episodeNumber: { type: sequelize_1.default.INTEGER, allowNull: false },
    seasonNumber: { type: sequelize_1.default.INTEGER, allowNull: false },
    videoURL: { type: sequelize_1.default.STRING, allowNull: false },
    duration: sequelize_1.default.INTEGER,
    thumbnailURL: { type: sequelize_1.default.STRING, allowNull: true },
    title: { type: sequelize_1.default.STRING, allowNull: true },
    plot: { type: sequelize_1.default.STRING, allowNull: true }
});
exports.default = Episode;
