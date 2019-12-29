import { httpGet } from '../Adapters/HTTPReq';
import Fetcher from './fetcher';
import Cacher from './russian/Cacher';
import { FSEditor } from '../Adapters/FSEditor';

// Example rest calls:
//
// http://www.omdbapi.com/?apikey=b2141cec&t=rick+and+morty&plot=full&type=series&Season=1
// http://www.omdbapi.com/?apikey=b2141cec&t=rick+and+morty&plot=full&type=series&Season=1&Episode=2

export class Omdb {
    static readonly API_KEY = 'b2141cec';

    private static seriesEndPoint = (seriesName: string) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${seriesName}&plot=full&type=series`;
    private static seasonEndPoint = (seriesName: string, season: number) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}`;
    private static episodeEndPoint = (seriesName: string, season: number, episode: number) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}&Episode=${episode}`;
    private static movieEndPoint = (movieName: string) => `http://www.omdbapi.com/?apikey=${Omdb.API_KEY}&t=${movieName}&plot=full&type=movie`;

    static fetchSeries = (seriesName: string) => httpGet(Omdb.seriesEndPoint(seriesName));
    static fetchSeason = (seriesName: string, season: number) => httpGet(Omdb.seasonEndPoint(seriesName, season));
    static fetchEpisode = (seriesName: string, season: number, episode: number) => httpGet(Omdb.episodeEndPoint(seriesName, season, episode));
    static fetchMovie = (movieName: string) => httpGet(Omdb.movieEndPoint(movieName));

    // Error respose:
    // {"Response":"False","Error":"Series or episode not found!"}
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

export class EnglishFetcher implements Fetcher {
    private readonly cacher = new Cacher<SeriesInfo>(new FSEditor()); // TODO: inject
    
    fetchSeries(seriesName: string): { title?: string | undefined; plot?: string | undefined; poster?: string | undefined; totalSeasons?: number | undefined; } {
        const seriesData = this.retrieveSeriesData(seriesName);

        if (!seriesData) throw new Error(`Couldn't find information on '${seriesName}'`);

        return seriesData.seriesInfo;
    }

    fetchEpisode(seriesName: string, season: number, episode: number): { title?: string | undefined; plot?: string | undefined; imdbRating?: string | undefined; } {
        const seriesData = this.retrieveSeriesData(seriesName);

        if (!seriesData) throw new Error(`Couldn't find information on '${seriesName}'`);

        const resultEpisode = seriesData.seasons.find(s => s.seasonNumber === season)?.episodes.find(ep => ep.episodeNumber === episode);
       
        if (!resultEpisode) throw new Error(`Couldn't find information on 'S${season}E${episode}'`);

        return resultEpisode;
    }
    
    retrieveSeriesData(seriesName: string) {
        const filename = seriesName.replace(/\s+/g, '_').toLowerCase();
        const cachedData = this.cacher.retrieveCachedData(filename, 'cache/en');

        if (cachedData) return cachedData;

        const data = this.fetchAll(seriesName);
        if (!data) return undefined;

        this.cacher.cacheData(filename, data, 'cache/en');
    }

    private fetchAll(seriesName: string) {
        const seriesInfo = this._fetchSeries(seriesName);
        if (!seriesInfo) return undefined;

        const totalSeasons = seriesInfo?.totalSeasons;
        const finalSeasons: Season[] = []

        if (totalSeasons) {

            for (let season = 1; season <= totalSeasons; season++) {
                const episodes = this.getEpisodeList(seriesName, season);

                if (!episodes) continue;
                
                const finalEpisodes: Episode[] =[];

                episodes.forEach(episode => {
                    const episodeNumber = parseInt(episode.Episode);
                    const episode_ = this._fetchEpisode(seriesName, season, episodeNumber);

                    finalEpisodes.push(
                        {
                            episodeNumber: episodeNumber,
                            title: episode_?.title,
                            plot: episode_?.plot
                        }
                    );
                });

                const season_ = { seasonNumber: season, episodes: finalEpisodes};
                finalSeasons.push(season_);
            }
        }

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

    private getEpisodeList(seriesName: string, season: number) {
        const seasonData = Omdb.fetchSeason(seriesName, season);
                
        if (seasonData.Error) return undefined;
        
        const seasons = seasonData as {Episodes?: {Title?: string, Episode: string, Plot?: string}[]};

        return seasons.Episodes?.filter(x => isNaN(parseInt(x.Episode)) === false);
    }
    
    private _fetchSeries(seriesName: string) {
        const seriesInfo = Omdb.fetchSeries(seriesName);

        if (seriesInfo.Error)
            return undefined;

        const {Title, Year, Plot, Poster, totalSeasons} = seriesInfo as {Title?: string, Year?: string, Plot?: string, Poster?: string, totalSeasons: number};

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
            return undefined;

        const {Title, Plot, imdbRating} = episodeInfo as {Title: string, Plot?: string, imdbRating?: string};

        return {
            title: Title,
            plot: Plot,
            imdbRating: imdbRating  
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