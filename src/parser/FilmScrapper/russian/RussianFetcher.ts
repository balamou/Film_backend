import cprocess from 'child_process';

export default class RussianFetcher {

    private execScript(title: string) {
        const process = cprocess.spawnSync('python3', ['main.py'], { encoding: 'utf-8' });

        if (process.stderr.length > 0)
            throw new Error(process.stderr);

        return process.stdout;
    }

    getSeries(title: string) {
        try {
            const output = this.execScript(title);
            const seriesData = JSON.parse(output) as {title: string, plot: string, poster?: string};
            console.log(seriesData);

            return seriesData;
        } catch (error) {
            console.log(error);
        }
    }
}

new RussianFetcher().getSeries("Rick and morty");
