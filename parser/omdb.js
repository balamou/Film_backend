const http = require('http');

const API_KEY = 'b2141cec';
const seriesEndPoint = seriesName => `http://www.omdbapi.com/?apikey=${API_KEY}&t=${seriesName}&plot=full&type=series`;
const seasonEndPoint = (seriesName, season) => `http://www.omdbapi.com/?apikey=${API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}`;
const episodeEndPoint = (seriesName, season, episode) => `http://www.omdbapi.com/?apikey=${API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}&Episode=${episode}`;
const movieEndPoint = movieName => `http://www.omdbapi.com/?apikey=${API_KEY}&t=${movieName}&plot=full&type=movie`;

const httpGet = url => {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            res.setEncoding('utf8');
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(body));
        }).on('error', reject);
    });
};

exports.fetchSeries = seriesName => httpGet(seriesEndPoint(seriesName));
exports.fetchSeason = (seriesName, season) => httpGet(seasonEndPoint(seriesName, season));
exports.fetchEpisode = (seriesName, season, episode) => httpGet(episodeEndPoint(seriesName, season, episode));
exports.fetchMovie = seriesName => httpGet(movieEndPoint(seriesName));
