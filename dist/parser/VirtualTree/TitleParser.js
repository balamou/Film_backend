"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parse_torrent_title_1 = __importDefault(require("parse-torrent-title"));
class TitleParserAdapter {
    parse(fileName) {
        const info = parse_torrent_title_1.default.parse(fileName);
        return {
            season: info.season,
            episode: info.episode
        };
    }
    parseSeasonFrom(folderName) {
        const info = parse_torrent_title_1.default.parse(folderName);
        return info.season;
    }
}
exports.TitleParserAdapter = TitleParserAdapter;
