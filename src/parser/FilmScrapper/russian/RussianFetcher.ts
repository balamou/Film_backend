import cprocess from 'child_process';

export default class RussianFetcher {

    getSeries(title: string) {
        const process = cprocess.spawnSync('python3', ['main.py'], { encoding: 'utf-8' });
        console.log(process.stderr);
        
        return process.stdout;
    }
}

const output = new RussianFetcher().getSeries("Hello");
console.log(output);