import cprocess from "child_process";
import path from "path";
import Fetcher from "../fetcher";

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
        const output = this.execScript(title);
        const seriesData = JSON.parse(output) as SeriesInfo;

        return seriesData;
    }
}

export default RussianFetcher;

try {
    const fetcher = new RussianFetcher();
    console.log(fetcher.fetchSeries("rick and morty"));
    console.log(fetcher.fetchEpisode("rick and morty", 1, 6));
} catch (error) {
    const pythonError = (error as Error).message;
    console.log(pythonError);
}
