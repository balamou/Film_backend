import { httpGet } from './Adapters/HTTPReq';

// Example rest calls:
//
// http://www.omdbapi.com/?apikey=b2141cec&t=rick+and+morty&plot=full&type=series&Season=1
// http://www.omdbapi.com/?apikey=b2141cec&t=rick+and+morty&plot=full&type=series&Season=1&Episode=2

export default class Omdb {
    static readonly API_KEY = 'b2141cec';
    
    private seriesEndPoint = (seriesName: string) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${seriesName}&plot=full&type=series`;
    private seasonEndPoint = (seriesName: string, season: string) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}`;
    private episodeEndPoint = (seriesName: string, season: string, episode: string) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}&Episode=${episode}`;
    private movieEndPoint = (movieName: string) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${movieName}&plot=full&type=movie`;

    fetchSeries = (seriesName: string) => httpGet(this.seriesEndPoint(seriesName));
    fetchSeason = (seriesName: string, season: string) => httpGet(this.seasonEndPoint(seriesName, season));
    fetchEpisode = (seriesName: string, season: string, episode: string) => httpGet(this.episodeEndPoint(seriesName, season, episode));
    fetchMovie = (seriesName: string) => httpGet(this.movieEndPoint(seriesName));
}