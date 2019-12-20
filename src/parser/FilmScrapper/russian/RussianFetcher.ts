import cprocess from "child_process";
import path from "path";

export default class RussianFetcher {
    private execScript(title: string) {
        const scriptPath = path.join(__dirname, "main.py");

        const process = cprocess.spawnSync("python3", [scriptPath, `"${title}"`], { encoding: "utf-8" });

        if (process.stderr.length > 0) throw new Error(process.stderr);

        return process.stdout;
    }

    getSeries(title: string) {
        type Episode = {episodeNumber: number, title?: string};
        type Season = {seasonNumber: number, episodes: Episode[]};

        const output = this.execScript(title);
        const seriesData = JSON.parse(output) as {
            seriesInfo: {
                title: string;
                plot: string;
                poster?: string;
            }, 
            seasons: Season[]
        };
        console.log(seriesData);

        return seriesData;
    }
}

try {
    new RussianFetcher().getSeries("rick and morty");
} catch (error) {
    const pythonError = (error as Error).message;
    console.log(pythonError);
}
