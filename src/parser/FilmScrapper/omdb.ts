import { httpGet } from '../Adapters/HTTPReq';

// Example rest calls:
//
// http://www.omdbapi.com/?apikey=b2141cec&t=rick+and+morty&plot=full&type=series&Season=1
// http://www.omdbapi.com/?apikey=b2141cec&t=rick+and+morty&plot=full&type=series&Season=1&Episode=2

export class Omdb {
    static readonly API_KEY = 'b2141cec';
    
    private static seriesEndPoint = (seriesName: string) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${seriesName}&plot=full&type=series`;
    private static seasonEndPoint = (seriesName: string, season: string) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}`;
    private static episodeEndPoint = (seriesName: string, season: string, episode: string) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}&Episode=${episode}`;
    private static movieEndPoint = (movieName: string) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${movieName}&plot=full&type=movie`;

    static fetchSeries = (seriesName: string) => httpGet(Omdb.seriesEndPoint(seriesName));
    static fetchSeason = (seriesName: string, season: string) => httpGet(Omdb.seasonEndPoint(seriesName, season));
    static fetchEpisode = (seriesName: string, season: string, episode: string) => httpGet(Omdb.episodeEndPoint(seriesName, season, episode));
    static fetchMovie = (movieName: string) => httpGet(Omdb.movieEndPoint(movieName));

    // Error respose:
    // {"Response":"False","Error":"Series or episode not found!"}
}

export class SeriesFetcher {
    
    fetchSeries(seriesName: string) {
        const seriesInfo = Omdb.fetchSeries(seriesName);

        if (seriesInfo.Error)
            throw new Error(seriesInfo.Error);

        return {
            title: seriesInfo.Title as string,
            plot: seriesInfo.Plot as string,
            poster: seriesInfo.Poster as string,
            totalSeasons: seriesInfo.totalSeasons as number
        };
    }

    fetchEpisode(seriesName: string, season: string, episode: string) {
        const episodeInfo = Omdb.fetchEpisode(seriesName, season, episode);

        if (episodeInfo.Error)
            throw new Error(episodeInfo.Error);
        
        return {
            title: episodeInfo.Title as string,
            plot: episodeInfo.Plot as string,
            imdbRating: episodeInfo.imdbRating as string
        };
    }

    fetchMovie(movieName: string) {
        const movieInfo = Omdb.fetchMovie(movieName);

        if (!movieInfo.Error)
            throw new Error(movieInfo.Error);

        return {
            title: movieInfo.Title as string,
            year: movieInfo.Year as string,
            plot: movieInfo.Plot as string,
            poster: movieInfo.Poster as string,
            imdbRating: movieInfo.imdbRating as string
        };
    }
}