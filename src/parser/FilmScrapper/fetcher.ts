export default interface Fetcher {
    fetchSeries(seriesName: string): {
        title?: string,
        plot?: string,
        poster?: string,
        totalSeasons?: number
    };
    fetchEpisode(seriesName: string, season: number, episode: number): {
        title?: string,
        plot?: string,
        imdbRating?: string
    };
    fetchMovie(movieName: string): {
        title?: string,
        year?: string,
        plot?: string,
        poster?: string,
        imdbRating?: string
    };
}
