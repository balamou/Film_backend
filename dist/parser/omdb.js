"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const API_KEY = 'b2141cec';
const seriesEndPoint = (seriesName) => `http://www.omdbapi.com/?apikey=${API_KEY}&t=${seriesName}&plot=full&type=series`;
const seasonEndPoint = (seriesName, season) => `http://www.omdbapi.com/?apikey=${API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}`;
const episodeEndPoint = (seriesName, season, episode) => `http://www.omdbapi.com/?apikey=${API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}&Episode=${episode}`;
const movieEndPoint = (movieName) => `http://www.omdbapi.com/?apikey=${API_KEY}&t=${movieName}&plot=full&type=movie`;
//http://www.omdbapi.com/?apikey=b2141cec&t=rick+and+morty&plot=full&type=series&Season=1
//http://www.omdbapi.com/?apikey=b2141cec&t=rick+and+morty&plot=full&type=series&Season=1&Episode=2
const httpGet = (url) => {
    return new Promise((resolve, reject) => {
        http_1.default.get(url, res => {
            res.setEncoding('utf8');
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const bodyInJSONFormat = JSON.parse(body);
                resolve(bodyInJSONFormat);
            });
        }).on('error', reject);
    });
};
exports.fetchSeries = (seriesName) => httpGet(seriesEndPoint(seriesName));
exports.fetchSeason = (seriesName, season) => httpGet(seasonEndPoint(seriesName, season));
exports.fetchEpisode = (seriesName, season, episode) => httpGet(episodeEndPoint(seriesName, season, episode));
exports.fetchMovie = (seriesName) => httpGet(movieEndPoint(seriesName));
