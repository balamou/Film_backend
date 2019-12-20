import cprocess from "child_process";
import path from "path";
import Fetcher from "../fetcher";
import { FSEditor } from "../../Adapters/FSEditor";
import YAML from 'yaml';

type Episode = {episodeNumber: number, title?: string};
type Season = {seasonNumber: number, episodes: Episode[]};
type SeriesInfo = {
    seriesInfo: {
        title: string;
        plot: string;
        poster?: string;
    }, 
    seasons: Season[]
};

class RussianFetcher implements Fetcher {
    private seriesInfo?: SeriesInfo
    private seriesName?: string
    private fsEditor = new FSEditor() // TODO: Swap using interface & inject

   
    private execScript(title: string) {
        const scriptPath = path.join(__dirname, "main.py");

        const process = cprocess.spawnSync("python3", [scriptPath, `"${title}"`], { encoding: "utf-8" });

        if (process.stderr.length > 0) throw new Error(process.stderr);

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

    fetchMovie(movieName: string): { title?: string | undefined; year?: string | undefined; plot?: string | undefined; poster?: string | undefined; imdbRating?: string | undefined; } {
        throw new Error("Method not implemented.");
    }

    private getSeries(title: string) {
        const path = title.replace(/\s+/g, '_');
        let seriesData = this.retrieveCachedData<SeriesInfo>(path);
        if (seriesData) return seriesData;

        // if no cached data make call
        const output = this.execScript(title);
        seriesData = JSON.parse(output) as SeriesInfo;
        
        // cache data
        this.cacheData<SeriesInfo>(path, seriesData);

        return seriesData;
    }

    // private abc(title: string) {
    //     return this.cache<SeriesInfo>(title, () => {
    //         const output = this.execScript(title);
    //         return JSON.parse(output) as SeriesInfo;
    //     });
    // }

    // private cache<T>(title: string, cb: () => T) {
    //     let data = this.retrieveCachedData<T>(title);
    //     if (data) return data;

    //     data = cb();
        
    //     this.cacheData<T>(title, data);

    //     return data;
    // }

    private retrieveCachedData<T>(file: string, dir: string = 'cache') {
        const cachedFile = `${dir}/${file}.yml`;

        if (this.fsEditor.doesFileExist(cachedFile)) {
            const cachedData = this.fsEditor.readFile(cachedFile);
            const seriesData = YAML.parse(cachedData) as T;

            return seriesData;
        }
    }

    private cacheData<T>(file: string, data: T, dir: string = 'cache') {
        this.fsEditor.makeDirectory(dir);
        this.fsEditor.writeToFile(`${dir}/${file}.yml`, YAML.stringify(data));
    }
}

export default RussianFetcher;

function test() {
    try {
        const fetcher = new RussianFetcher();
        console.log(fetcher.fetchSeries("game of thrones"));
        console.log(fetcher.fetchEpisode("rick and morty", 1, 8));
    } catch (error) {
        const pythonError = (error as Error).message;
        console.log(pythonError);
    }
}
test();