import Cacher from '../FilmScrapper/russian/Cacher';
import { Omdb } from '../FilmScrapper/omdb';
import { FSEditor } from '../Adapters/FSEditor';
import chalk from 'chalk';
import FetcherProtocol, { SeriesInfo, SearchType, Season, Movie, MovieFetcherProtocol } from "./FetcherProtocol";

class EnglishFetcherPrompt implements FetcherProtocol {
    private readonly cacher = new Cacher<SeriesInfo>(new FSEditor());
  
    searchResults(title: string) {
        let searchResults = Omdb.fetchSearchResults(title.replace(/\s+/, '+'));

        if (!searchResults || searchResults.Error) return;
        
        const results = searchResults.Search as SearchType[];

        return results;
    } 

    orginizeSearchResults(results: SearchType[]) {
        let table = [['#', 'Title', 'Year', 'Type']];
        let count = 0;

        results.forEach(item => {
            let type = item.Type;
            type = type === 'series' ? chalk.black.bgBlueBright(type) : chalk.black.bgGreenBright(type);

            table.push([`${count}`, item.Title, item.Year, type]);
            count++;
        });

        return table;
    }

    orginizeSeriesInfo(info: SeriesInfo) {
        let result = [['Episode #', 'Title', 'Plot']];

        info.seasons.forEach(season => {
            let seasonNum = chalk.bgBlueBright.black(`Season ${season.seasonNumber}`);
            result.push([seasonNum, '', '']);

            season.episodes.forEach(episode => {
                let no_title = chalk.bgRed.black('no title');
                let no_plot = chalk.bgRed.black('no plot');
                result.push([`${episode.episodeNumber}`, episode.title ?? no_title, episode.plot ?? no_plot]);
            });
        });

        return result;
    }

    retrieveSeriesData(imdbID: string) {
        const cachedData = this.cacher.retrieveCachedData(imdbID, 'cache/en/series');

        if (cachedData) return cachedData;

        const data = this.fetchEntireShow(imdbID);
        if (!data) return undefined;

        this.cacher.cacheData(imdbID, data, 'cache/en/series');
        return data;
    }

    private fetchEntireShow(imdbId: string) {
        const seriesInfo = this._fetchSeries(imdbId);
        if (!seriesInfo) return undefined;

        const totalSeasons = seriesInfo?.totalSeasons;
        const finalSeasons = totalSeasons === undefined ? [] : this.getAllSeasons(imdbId, totalSeasons);

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

    private getAllSeasons(imdbId: string, totalSeasons: number) {
        const allSeasons: Season[] = [];

        for (let seasonNumber = 1; seasonNumber <= totalSeasons; seasonNumber++) {
            const episodeNumbers = this.getEpisodeListInSeason(imdbId, seasonNumber); // need this request to fetch the episode plot

            if (!episodeNumbers) continue;
            
            const finalEpisodes = episodeNumbers.map(episodeNumber => this._fetchEpisode(imdbId, seasonNumber, episodeNumber));
    
            allSeasons.push({ seasonNumber: seasonNumber, episodes: finalEpisodes });
        }

        return allSeasons;
    }

    private getEpisodeListInSeason(imdbId: string, season: number) {
        const seasonData = Omdb.fetchSeasonByImdbId(imdbId, season);
                
        if (seasonData.Error) return undefined;
        
        const { Episodes } = seasonData as {Episodes?: {Episode: string}[]};

        if (!Episodes) return undefined;

        return Episodes.map(x => parseInt(x.Episode)).filter(x => !isNaN(x));
    }
    
    private _fetchSeries(imdbId: string) {
        const seriesInfo = Omdb.fetchSeriesByImdbId(imdbId);

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

    private _fetchEpisode(imdbId: string, season: number, episode: number) {
        const episodeInfo = Omdb.fetchEpisodeByImdbId(imdbId, season, episode);

        if (episodeInfo.Error)
            return { episodeNumber: episode, title: undefined, plot: undefined};

        const {Title, Plot} = episodeInfo as {Title?: string, Plot?: string};

        return {
            episodeNumber: episode,
            title: Title,
            plot: Plot,
        };
    }
}

export class EnglishMovieFetcherPrompt extends EnglishFetcherPrompt implements MovieFetcherProtocol {
    private readonly moviesCacher = new Cacher<Movie>(new FSEditor());

    fetchMovie(imdbID: string) { 
        const key = imdbID.replace(/\s+/g, '_').toLowerCase();
        let movieData = this.moviesCacher.retrieveCachedData(key, 'cache/en/movies');

        if (movieData) return movieData;

        movieData = this._fetchMovie(imdbID);

        this.moviesCacher.cacheData(key, movieData, 'cache/en/movies');

        return movieData;
    }

    private _fetchMovie(imdbID: string) {
        const movieInfo = Omdb.fetchMovieByImdbId(imdbID);

        if (movieInfo.Error)
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


export default EnglishFetcherPrompt;