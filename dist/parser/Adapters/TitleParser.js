"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parse_torrent_title_1 = __importDefault(require("parse-torrent-title"));
class TitleParserAdapter {
    parse(fileName) {
        const info = parse_torrent_title_1.default.parse(fileName);
        let season = info.season;
        let episode = info.episode;
        // fallback regex
        if (!episode) {
            const result = fileName.match(/(E|e)(\d+)/);
            if (result)
                episode = parseInt(result[2]); // grab second group
        }
        return {
            season: season,
            episode: episode
        };
    }
    parseSeasonFrom(folderName) {
        const allNumbers = folderName.replace(/\D+/g, '');
        const seasonNumber = parseInt(allNumbers);
        return seasonNumber;
    }
}
exports.TitleParserAdapter = TitleParserAdapter;
