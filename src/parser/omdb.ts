import http from 'http';

const API_KEY = 'b2141cec';
const seriesEndPoint = (seriesName: string) => `http://www.omdbapi.com/?apikey=${API_KEY}&t=${seriesName}&plot=full&type=series`;
const seasonEndPoint = (seriesName: string, season: string) => `http://www.omdbapi.com/?apikey=${API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}`;
const episodeEndPoint = (seriesName: string, season: string, episode: string) => `http://www.omdbapi.com/?apikey=${API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}&Episode=${episode}`;
const movieEndPoint = (movieName: string) => `http://www.omdbapi.com/?apikey=${API_KEY}&t=${movieName}&plot=full&type=movie`;

//http://www.omdbapi.com/?apikey=b2141cec&t=rick+and+morty&plot=full&type=series&Season=1
//http://www.omdbapi.com/?apikey=b2141cec&t=rick+and+morty&plot=full&type=series&Season=1&Episode=2

const httpGet = (url: string) => {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
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

export const fetchSeries = (seriesName: string) => httpGet(seriesEndPoint(seriesName));
export const fetchSeason = (seriesName: string, season: string) => httpGet(seasonEndPoint(seriesName, season));
export const fetchEpisode = (seriesName: string, season: string, episode: string) => httpGet(episodeEndPoint(seriesName, season, episode));
export const fetchMovie = (seriesName: string) => httpGet(movieEndPoint(seriesName));