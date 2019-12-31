import cprocess from "child_process";
import path from "path";
import Fetcher from "../fetcher";
import { FSEditor } from "../../Adapters/FSEditor";
import Cacher from "./Cacher";
import { EnglishFetcher } from "../omdb";

type Episode = {episodeNumber: number, title?: string};
type Season = {seasonNumber: number, episodes: Episode[]};
type SeriesInfo = {
    seriesInfo: {
        title: string;
        year?: string;
        plot: string;
        poster?: string;
    }, 
    seasons: Season[]
};
type Movie = {
    title?: string,
    year?: string,
    plot?: string,
    poster?: string,
    imdbRating?: string,
}

class RussianFetcher implements Fetcher {
    private seriesInfo?: SeriesInfo;
    private seriesName?: string;
    private readonly cacher = new Cacher<SeriesInfo>(new FSEditor()); // TODO: inject
    private readonly moviesCacher = new Cacher<Movie>(new FSEditor()); // TODO: inject
    
    /**
     * @param mode `show` or `movie`. Searches for the specific type of content by title.
    */
    private execScript(title: string, mode: string = 'show') {
        const scriptPath = path.join(__dirname, "main.py");
        let options = [scriptPath, `"${title}"`];

        if (mode === 'movie') {
            options = [scriptPath, '-m', `"${title}"`];
        }

        const process = cprocess.spawnSync("python3", options, { encoding: "utf-8" });

        if (process.stderr.length > 0) {
            const moduleNotInstalled = process.stderr.match(/(No module named)\s\'(.+)\'/);
            if (moduleNotInstalled) {
                const mod = moduleNotInstalled[2];
                throw new Error(`Python module '${mod}' not installed.\nPlease run: sudo pip3 install ${mod}`);
            }

            throw new Error(process.stderr);
        }

        return process.stdout;
    }

    fetchSeries(seriesName: string): { title?: string | undefined; plot?: string | undefined; poster?: string | undefined; totalSeasons?: number | undefined; } {
        if (!this.seriesInfo || this.seriesName !== seriesName) {
            this.seriesInfo = this.getSeries(seriesName);
            this.seriesName = seriesName;
        }
        
        return {
            title: this.seriesInfo.seriesInfo.title,
            plot: this.seriesInfo.seriesInfo.plot,
            poster: this.seriesInfo.seriesInfo.poster,
            totalSeasons: this.seriesInfo.seasons.length
        };
    }

    fetchEpisode(seriesName: string, season: number, episode: number): { title?: string | undefined; plot?: string | undefined; imdbRating?: string | undefined; } {
        if (!this.seriesInfo || this.seriesName !== seriesName) {
            this.seriesInfo = this.getSeries(seriesName);
            this.seriesName = seriesName;
        }

        const fetchedSeason = this.seriesInfo.seasons.find(s => { return s.seasonNumber === season; });

        if (!fetchedSeason) throw new Error(`Season ${season} of ${seriesName} not found`);

        const fetchedEpisode = fetchedSeason.episodes.find(ep => {return ep.episodeNumber === episode});

        if (!fetchedEpisode) throw new Error(`Episode ${episode} of season ${season} of show '${seriesName}' not found`);
        
        return {
            title: fetchedEpisode.title
        };
    }

    fetchMovie(movieName: string) {
        const key = movieName.replace(/\s+/g, '_').toLowerCase();
        let movieData = this.moviesCacher.retrieveCachedData(key, 'cache/ru/movies');
        
        if (movieData) return movieData;

        movieData = this.makeKinopoiskRequestMovie(movieName);

        this.moviesCacher.cacheData(key, movieData, 'cache/ru/movies')
        
        return movieData;
    }

    private makeKinopoiskRequestMovie(movieTitle: string) {
        try {
            const output = this.execScript(movieTitle, 'movie');
            const movieData = JSON.parse(output) as Movie;
            
            // TODO: Add backup to get the poster image

            return movieData;
        } catch {
            throw new Error(`Movie with title '${movieTitle}' not found!`);
        }
    }

    private getSeries(title: string) {
        const path = title.trim().replace(/\s+/g, '_').toLocaleLowerCase();
        let seriesData = this.cacher.retrieveCachedData(path, 'cache/ru/series');
        if (seriesData) return seriesData;

        // if no cached data make call
        const output = this.execScript(title);
        seriesData = JSON.parse(output) as SeriesInfo;
        
        if (!seriesData.seriesInfo.poster) {
            // backup poster fetcher
            const backup = new EnglishFetcher().fetchSeries(title);
            seriesData.seriesInfo.poster = backup.poster;
        }

        // cache data
        this.cacher.cacheData(path, seriesData, 'cache/ru/series');

        return seriesData;
    }
}

export default RussianFetcher;