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
const HTTPReq_1 = require("../Adapters/HTTPReq");
// Example rest calls:
//
// http://www.omdbapi.com/?apikey=b2141cec&t=rick+and+morty&plot=full&type=series&Season=1
// http://www.omdbapi.com/?apikey=b2141cec&t=rick+and+morty&plot=full&type=series&Season=1&Episode=2
class Omdb {
}
exports.Omdb = Omdb;
Omdb.API_KEY = 'b2141cec';
Omdb.seriesEndPoint = (seriesName) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${seriesName}&plot=full&type=series`;
Omdb.seasonEndPoint = (seriesName, season) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}`;
Omdb.episodeEndPoint = (seriesName, season, episode) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}&Episode=${episode}`;
Omdb.movieEndPoint = (movieName) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${movieName}&plot=full&type=movie`;
Omdb.fetchSeries = (seriesName) => HTTPReq_1.httpGet(Omdb.seriesEndPoint(seriesName));
Omdb.fetchSeason = (seriesName, season) => HTTPReq_1.httpGet(Omdb.seasonEndPoint(seriesName, season));
Omdb.fetchEpisode = (seriesName, season, episode) => HTTPReq_1.httpGet(Omdb.episodeEndPoint(seriesName, season, episode));
Omdb.fetchMovie = (seriesName) => HTTPReq_1.httpGet(Omdb.movieEndPoint(seriesName));
class SeriesFetcher {
    fetchSeries(seriesName) {
        return __awaiter(this, void 0, void 0, function* () {
            const seriesInfo = yield Omdb.fetchSeries(seriesName);
            if (!seriesInfo.Error)
                throw new Error(seriesInfo.Error);
            return {
                title: seriesInfo.Title,
                plot: seriesInfo.Plot,
                poster: seriesInfo.Poster,
                totalSeasons: seriesInfo.totalSeasons
            };
        });
    }
    fetchEpisode(seriesName, season, episode) {
        return __awaiter(this, void 0, void 0, function* () {
            const episodeInfo = yield Omdb.fetchEpisode(seriesName, season, episode);
            if (!episodeInfo.Error)
                throw new Error(episodeInfo.Error);
            return {
                title: episodeInfo.Title,
                plot: episodeInfo.Plot,
                imdbRating: episodeInfo.imdbRating
            };
        });
    }
}
exports.SeriesFetcher = SeriesFetcher;
