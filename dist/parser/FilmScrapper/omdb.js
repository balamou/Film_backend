"use strict";
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
Omdb.fetchMovie = (movieName) => HTTPReq_1.httpGet(Omdb.movieEndPoint(movieName));
class SeriesFetcher {
    fetchSeries(seriesName) {
        const seriesInfo = Omdb.fetchSeries(seriesName);
        if (seriesInfo.Error)
            throw new Error(seriesInfo.Error);
        return {
            title: seriesInfo.Title,
            plot: seriesInfo.Plot,
            poster: seriesInfo.Poster,
            totalSeasons: seriesInfo.totalSeasons
        };
    }
    fetchEpisode(seriesName, season, episode) {
        const episodeInfo = Omdb.fetchEpisode(seriesName, season, episode);
        if (episodeInfo.Error)
            throw new Error(episodeInfo.Error);
        return {
            title: episodeInfo.Title,
            plot: episodeInfo.Plot,
            imdbRating: episodeInfo.imdbRating
        };
    }
    fetchMovie(movieName) {
        const movieInfo = Omdb.fetchMovie(movieName);
        if (!movieInfo.Error)
            throw new Error(movieInfo.Error);
        return {
            title: movieInfo.Title,
            year: movieInfo.Year,
            plot: movieInfo.Plot,
            poster: movieInfo.Poster,
            imdbRating: movieInfo.imdbRating
        };
    }
}
exports.SeriesFetcher = SeriesFetcher;
