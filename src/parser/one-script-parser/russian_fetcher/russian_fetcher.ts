import cprocess from "child_process";
import path from "path";
import { FSEditor } from "../../Adapters/FSEditor";
import Cacher from '../../FilmScrapper/russian/Cacher';
import chalk from "chalk";
import FetcherProtocol, { SeriesInfo, SearchType } from "../FetcherProtocol";

class RussianFetcherPrompt implements FetcherProtocol {
    private readonly cacher = new Cacher<SeriesInfo>(new FSEditor());
    private readonly cacheFolder = 'cache/ru/series';
    
    /**
     * @param mode `show` or `movie`. Searches for the specific type of content by title.
    */
    private execScript(title: string, mode: string = 'show') {
        const scriptPath = path.join(__dirname, "main.py");
        let options = [scriptPath, `${title}`];

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

    retrieveSeriesData(imdbID: string) {
        let seriesData = this.cacher.retrieveCachedData(imdbID, this.cacheFolder);
        if (seriesData) return seriesData;

        try {
            // if no cached data make call
            const output = this.execScript(imdbID);
            seriesData = JSON.parse(output) as SeriesInfo;
        } catch {
            return;
        }
        
        // cache data
        this.cacher.cacheData(imdbID, seriesData, this.cacheFolder);

        return seriesData;
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
}

export default RussianFetcherPrompt;

// const fetcher = new RussianFetcherPrompt();
// // const searchResults = fetcher.searchResults('Breaking bad');
// // if (searchResults) {
// //     const abc = fetcher.orginizeSearchResults(searchResults);
// //     console.log(table(abc));
// // }

// const seriesInfo = fetcher.retrieveSeriesData('404900');
// const abc = fetcher.orginizeSeriesInfo(seriesInfo);
// console.log(table(abc));