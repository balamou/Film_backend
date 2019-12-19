import cprocess from "child_process";
import path from "path";

export default class RussianFetcher {
    private execScript(title: string) {
        const scriptPath = path.join(__dirname, "main.py");
        console.log(scriptPath);

        const process = cprocess.spawnSync(
            "python3",
            [scriptPath, `"${title}"`],
            {
                encoding: "utf-8"
            }
        );

        if (process.stderr.length > 0) throw new Error(process.stderr);

        return process.stdout;
    }

    getSeries(title: string) {
        try {
            const output = this.execScript(title);
            const seriesData = JSON.parse(output) as {
                title: string;
                plot: string;
                poster?: string;
            };
            console.log(seriesData);

            return seriesData;
        } catch (error) {
            const pythonError = (error as Error).message;
            console.log(pythonError);
        }
    }
}

new RussianFetcher().getSeries("rick and morty");
