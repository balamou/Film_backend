"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPReq_1 = require("./Adapters/HTTPReq");
// Example rest calls:
//
// http://www.omdbapi.com/?apikey=b2141cec&t=rick+and+morty&plot=full&type=series&Season=1
// http://www.omdbapi.com/?apikey=b2141cec&t=rick+and+morty&plot=full&type=series&Season=1&Episode=2
class Omdb {
    constructor() {
        this.seriesEndPoint = (seriesName) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${seriesName}&plot=full&type=series`;
        this.seasonEndPoint = (seriesName, season) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}`;
        this.episodeEndPoint = (seriesName, season, episode) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}&Episode=${episode}`;
        this.movieEndPoint = (movieName) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${movieName}&plot=full&type=movie`;
        this.fetchSeries = (seriesName) => HTTPReq_1.httpGet(this.seriesEndPoint(seriesName));
        this.fetchSeason = (seriesName, season) => HTTPReq_1.httpGet(this.seasonEndPoint(seriesName, season));
        this.fetchEpisode = (seriesName, season, episode) => HTTPReq_1.httpGet(this.episodeEndPoint(seriesName, season, episode));
        this.fetchMovie = (seriesName) => HTTPReq_1.httpGet(this.movieEndPoint(seriesName));
    }
}
exports.default = Omdb;
Omdb.API_KEY = 'b2141cec';
