import { httpGet } from '../Adapters/HTTPReq';
import Fetcher from './fetcher';
import Cacher from './russian/Cacher';
import { FSEditor } from '../Adapters/FSEditor';
require("dotenv").config();

export class Omdb {
    private static get API_KEY() {
        if (!process.env.OMDB_KEY) throw new Error('Please speficy the OMDB_KEY in the .env file');
        
        return process.env.OMDB_KEY; // b2141cec
    }
    
    // Example rest calls:
    //
    // http://www.omdbapi.com/?apikey=b2141cec&t=rick+and+morty&plot=full&type=series&Season=1
    // http://www.omdbapi.com/?apikey=b2141cec&t=rick+and+morty&plot=full&type=series&Season=1&Episode=2
    private static seriesEndPoint = (seriesName: string) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${seriesName}&plot=full&type=series`;
    private static seasonEndPoint = (seriesName: string, season: number) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}`;
    private static episodeEndPoint = (seriesName: string, season: number, episode: number) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}&Episode=${episode}`;
    private static movieEndPoint = (movieName: string) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${movieName}&plot=full&type=movie`;

    static fetchSeries = (seriesName: string) => httpGet(Omdb.seriesEndPoint(seriesName));
    static fetchSeason = (seriesName: string, season: number) => httpGet(Omdb.seasonEndPoint(seriesName, season));
    static fetchEpisode = (seriesName: string, season: number, episode: number) => httpGet(Omdb.episodeEndPoint(seriesName, season, episode));
    static fetchMovie = (movieName: string) => httpGet(Omdb.movieEndPoint(movieName));

    // Error respose:
    // { "Response": "False", "Error": "Series or episode not found!" }
}

type Episode = {episodeNumber: number, title?: string, plot?: string};
type Season = {seasonNumber: number, episodes: Episode[]};
type SeriesInfo = {
    seriesInfo: {
        title?: string;
        year?: string;
        plot?: string;
        poster?: string;
    }, 
    seasons: Season[]
};
type Movie = {
    title?: string,
    year?: string,
    plot?: string,
    poster?: string,
    imdbRating?: string
};

export class EnglishFetcher implements Fetcher {
    private readonly cacher = new Cacher<SeriesInfo>(new FSEditor()); // TODO: inject
    private readonly moviesCacher = new Cacher<Movie>(new FSEditor()); // TODO: inject

    fetchSeries(seriesName: string): { title?: string | undefined; plot?: string | undefined; poster?: string | undefined; totalSeasons?: number | undefined; } {
        const seriesData = this.retrieveSeriesData(seriesName);

        if (!seriesData) throw new Error(`Couldn't find information on '${seriesName}'`);

        return seriesData.seriesInfo;
    }

    fetchEpisode(seriesName: string, season: number, episode: number): { title?: string | undefined; plot?: string | undefined; imdbRating?: string | undefined; } {
        const seriesData = this.retrieveSeriesData(seriesName);

        if (!seriesData) throw new Error(`Couldn't find information on '${seriesName}'`);

        const resultEpisode = seriesData.seasons.find(s => s.seasonNumber === season)?.episodes.find(ep => ep.episodeNumber === episode);
       
        if (!resultEpisode) throw new Error(`Couldn't find information on 'S${season}E${episode}' of '${seriesName}'`);

        return resultEpisode;
    }
    
    private retrieveSeriesData(seriesName: string) {
        const filename = seriesName.replace(/\s+/g, '_').toLowerCase();
        const cachedData = this.cacher.retrieveCachedData(filename, 'cache/en/series');

        if (cachedData) return cachedData;

        const data = this.fetchAll(seriesName);
        if (!data) return undefined;

        this.cacher.cacheData(filename, data, 'cache/en/series');
        return data;
    }

    private fetchAll(seriesName: string) {
        const seriesInfo = this._fetchSeries(seriesName);
        if (!seriesInfo) return undefined;

        const totalSeasons = seriesInfo?.totalSeasons;
        const finalSeasons = totalSeasons === undefined ? [] : this.getAllSeasons(seriesName, totalSeasons);

        return {
            seriesInfo: {
                title: seriesInfo.title,
                year: seriesInfo.year,
                plot: seriesInfo.plot,
                poster: seriesInfo.poster,
            },
            seasons: finalSeasons
        } as SeriesInfo;
    }

    private getAllSeasons(seriesName: string, totalSeasons: number) {
        const allSeasons: Season[] = [];

        for (let seasonNumber = 1; seasonNumber <= totalSeasons; seasonNumber++) {
            const episodeNumbers = this.getEpisodeListInSeason(seriesName, seasonNumber); // need this request to fetch the episode plot

            if (!episodeNumbers) continue;
            
            const finalEpisodes = episodeNumbers.map(episodeNumber => this._fetchEpisode(seriesName, seasonNumber, episodeNumber));
    
            allSeasons.push({ seasonNumber: seasonNumber, episodes: finalEpisodes });
        }

        return allSeasons;
    }

    private getEpisodeListInSeason(seriesName: string, season: number) {
        const seasonData = Omdb.fetchSeason(seriesName, season);
                
        if (seasonData.Error) return undefined;
        
        const { Episodes } = seasonData as {Episodes?: {Episode: string}[]};

        if (!Episodes) return undefined;

        return Episodes.map(x => parseInt(x.Episode)).filter(x => !isNaN(x));
    }
    
    private _fetchSeries(seriesName: string) {
        const seriesInfo = Omdb.fetchSeries(seriesName);

        if (seriesInfo.Error)
            return undefined;

        const {Title, Year, Plot, Poster, totalSeasons} = seriesInfo as {Title?: string, Year?: string, Plot?: string, Poster?: string, totalSeasons?: number};

        return {
            title: Title,
            year: Year,
            plot: Plot,
            poster: Poster,
            totalSeasons: totalSeasons
        };
    }

    private _fetchEpisode(seriesName: string, season: number, episode: number) {
        const episodeInfo = Omdb.fetchEpisode(seriesName, season, episode);

        if (episodeInfo.Error)
            return { episodeNumber: episode, title: undefined, plot: undefined};

        const {Title, Plot} = episodeInfo as {Title?: string, Plot?: string};

        return {
            episodeNumber: episode,
            title: Title,
            plot: Plot,
        };
    }
    
    fetchMovie(movieName: string) { 
        const key = movieName.replace(/\s+/g, '_').toLowerCase();
        let movieData = this.moviesCacher.retrieveCachedData(key, 'cache/en/movies');

        if (movieData) return movieData;

        movieData = this._fetchMovie(movieName);

        this.moviesCacher.cacheData(key, movieData, 'cache/en/movies');

        return movieData;
    }

    private _fetchMovie(movieName: string) {
        const movieInfo = Omdb.fetchMovie(movieName);

        if (!movieInfo.Error)
            throw new Error(movieInfo.Error);

        const { Title, Year, Plot, Poster, imdbRating } = movieInfo as { Title?: string, Year?: string, Plot?: string, Poster?: string, imdbRating?: string };

        return {
            title: Title,
            year: Year,
            plot: Plot,
            poster: Poster,
            imdbRating: imdbRating
        };
    }
}