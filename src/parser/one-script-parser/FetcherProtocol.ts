export type Episode = {episodeNumber: number, title?: string, plot?: string};
export type Season = {seasonNumber: number, episodes: Episode[]};
export type SeriesInfo = {
    seriesInfo: {
        title: string;
        year?: string;
        plot: string;
        poster?: string;
    }, 
    seasons: Season[]
};
export type Movie = {
    title?: string,
    year?: string,
    plot?: string,
    poster?: string,
    imdbRating?: string,
}

export type SearchType = { Title: string, Year: string, imdbID: string, Type: string, Poster: string };


interface FetcherProtocol {
    searchResults(title: string): SearchType[] | undefined;
    orginizeSearchResults(results: SearchType[]): string[][];
    retrieveSeriesData(imdbID: string): SeriesInfo | undefined;
    orginizeSeriesInfo(info: SeriesInfo): string[][];
}

export default FetcherProtocol;