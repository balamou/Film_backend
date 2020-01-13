import Cacher from '../FilmScrapper/russian/Cacher';
import { Omdb } from '../FilmScrapper/omdb';

import { FSEditor } from '../Adapters/FSEditor';

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

type SearchType = { Title: string, Year: string, imdbID: string, Type: string, Poster: string };

class EnglishFetcherPrompt {
    
    searchResults(title: string) {
        let searchResults = Omdb.fetchSearchResults(title.replace(/\s+/, '+'));

        if (!searchResults || searchResults.Error) return;
        
        const results = searchResults.Search as SearchType[];

        return this.orginizeSearchResults(results);
    } 

    private orginizeSearchResults(results: SearchType[]) {
        let table = [['#', 'Title', 'Year', 'Type']];
        let count = 0;

        results.forEach(item => {
            table.push([`${count}`, item.Title, item.Year, item.Type]);
            count++;
        });

        return table;
    }
}

export default EnglishFetcherPrompt;