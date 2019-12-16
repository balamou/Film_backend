import cprocess from 'child_process';

export default class RussianFetcher {

    getSeries(title: string) {
        const process = cprocess.spawnSync('python3', ['main.py'], { encoding: 'utf-8' });

        if (process.stderr.length > 0)
            throw new Error(process.stderr);

        return process.stdout;
    }
}

try {
    const output = new RussianFetcher().getSeries("Hello");
    const data = JSON.parse(output);
    console.log(data);
} catch (error) {
    console.log(error);
}