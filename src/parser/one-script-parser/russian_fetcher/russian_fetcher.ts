import cprocess from "child_process";
import path from "path";
import { FSEditor } from "../../Adapters/FSEditor";
import Cacher from '../../FilmScrapper/russian/Cacher';
import chalk from "chalk";
import { table } from "table";


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

type SearchType = { Title: string, Year: string, imdbID: string, Type: string, Poster: string };

class RussianFetcher {
    private readonly cacher = new Cacher<SeriesInfo>(new FSEditor());
    private readonly cacheFolder = 'cache/ru/series';
    
    /**
     * @param mode `show` or `movie`. Searches for the specific type of content by title.
    */
    private execScript(title: string, mode: string = 'show') {
        const scriptPath = path.join(__dirname, "main.py");
        let options = [scriptPath, `"${title}"`];

        if (mode === 'movie') {
            options = [scriptPath, '-m', `"${title}"`];
        }

        if (mode === 'search') {
            options = [scriptPath, '-s', `"${title}"`];
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

    searchResults(title: string) {
        try {
            const output = this.execScript(title, 'search');
            const searchResults = JSON.parse(output) as SearchType[];

            return searchResults;
        } catch {
            return;
        }
    }

    retrieveSeriesData(imdbID: string) {
        let seriesData = this.cacher.retrieveCachedData(imdbID, this.cacheFolder);
        if (seriesData) return seriesData;

        // if no cached data make call
        const output = this.execScript(imdbID);
        seriesData = JSON.parse(output) as SeriesInfo;
        
        // cache data
        this.cacher.cacheData(imdbID, seriesData, this.cacheFolder);

        return seriesData;
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
}

export default RussianFetcher;

const fetcher = new RussianFetcher();
const searchResults = fetcher.searchResults('Breaking bad');
if (searchResults) {
    const abc = fetcher.orginizeSearchResults(searchResults);
    console.log(table(abc));
}