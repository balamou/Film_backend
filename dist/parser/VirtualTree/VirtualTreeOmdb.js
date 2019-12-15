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
Object.defineProperty(exports, "__esModule", { value: true });
const omdb_1 = require("../FilmScrapper/omdb");
class VirtualTreeOmdb {
    findInformation(seriesName, virtualTree) {
        return __awaiter(this, void 0, void 0, function* () {
            const fetcher = new omdb_1.SeriesFetcher();
            const seriesInfo = yield fetcher.fetchSeries(seriesName);
            const episodeData = [];
            yield virtualTree.asyncForEach((season, episode) => __awaiter(this, void 0, void 0, function* () {
                const seasonNum = season.seasonNum.toString();
                const episodeNum = episode.episodeNum.toString();
                try {
                    const episodeInfo = yield fetcher.fetchEpisode(seriesName, seasonNum, episodeNum);
                    episodeData.push({
                        title: episodeInfo.title,
                        plot: episodeInfo.plot
                    });
                }
                catch (_a) {
                    // fallback model
                    console.log(`Error parsing for '${seriesName}' season ${seasonNum} episode ${episodeNum}`);
                }
            }));
            return {
                seriesInfo: seriesInfo,
                episodeData: episodeData
            };
        });
    }
}
exports.default = VirtualTreeOmdb;
