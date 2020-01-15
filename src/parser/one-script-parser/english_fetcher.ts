import Cacher from '../FilmScrapper/russian/Cacher';
import { Omdb } from '../FilmScrapper/omdb';
import { FSEditor } from '../Adapters/FSEditor';
import chalk from 'chalk';

type Episode = {episodeNumber: number, title?: string, plot?: string};
type Season = {seasonNumber: number, episodes: Episode[]};
export type SeriesInfo = {
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

type SearchType = { Title: string, Year: string, imdbID: string, Type: string, Poster: string };

class EnglishFetcherPrompt {
    private readonly cacher = new Cacher<SeriesInfo>(new FSEditor()); // TODO: inject
  
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
            let seasonNum = chalk.bgRedBright.black(`Season ${season.seasonNumber}`);
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

export default EnglishFetcherPrompt;