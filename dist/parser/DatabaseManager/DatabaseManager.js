"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const episode_1 = __importDefault(require("../../model/episode"));
const series_1 = __importDefault(require("../../model/series"));
class DatabaseManager {
    commitToDB(path, seriesName, seriesInfo) {
        // this method makes _commitToDB execute asynchronously
        const synchronize = require('synchronized-promise');
        const syncCommitToDB = synchronize(this._commitToDB);
        syncCommitToDB(path, seriesName, seriesInfo);
    }
    _commitToDB(path, seriesName, seriesInfo) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            // nil coalescing and optional chaining will be marked as an error
            // but it can be safely ignored
            yield series_1.default.create({
                language: 'en',
                folder: path,
                title: (_b = (_a = seriesInfo.seriesInfo) === null || _a === void 0 ? void 0 : _a.title, (_b !== null && _b !== void 0 ? _b : seriesName)),
                seasons: (_c = seriesInfo.seriesInfo) === null || _c === void 0 ? void 0 : _c.totalSeasons,
                desc: (_d = seriesInfo.seriesInfo) === null || _d === void 0 ? void 0 : _d.plot,
                poster: (_e = seriesInfo.seriesInfo) === null || _e === void 0 ? void 0 : _e.poster
            }, { logging: true });
            for (const videoInfo of seriesInfo.videoInfo) {
                yield episode_1.default.create({
                    episodeNumber: videoInfo.episode,
                    seasonNumber: videoInfo.season,
                    videoURL: videoInfo.videoPath,
                    duration: (_f = videoInfo.duration, (_f !== null && _f !== void 0 ? _f : 10)),
                    thumbnailURL: videoInfo.thumbnail,
                    title: videoInfo.title,
                    plot: videoInfo.plot
                }, { logging: false });
            }
        });
    }
}
exports.default = DatabaseManager;
