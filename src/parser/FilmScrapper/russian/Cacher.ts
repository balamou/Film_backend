import { FileSystemEditor } from "../../Adapters/FSEditor";
import YAML from 'yaml';

class Cacher<T> {
    private fsEditor: FileSystemEditor
    private readonly maxValidDays: number // Caching policy: maximum number of days the cache is valid

    constructor(fsEditor: FileSystemEditor, maxValidDays: number = 336) {
        this.fsEditor = fsEditor
        this.maxValidDays = maxValidDays
    }

    retrieveCachedData(file: string, dir: string = 'cache') {
        const cachedFile = `${dir}/${file}.yml`;

        if (!this.fsEditor.doesFileExist(cachedFile)) return;
        
        const cachedData = this.fsEditor.readFile(cachedFile);
        const seriesData = YAML.parse(cachedData) as T & { dateCached: Date };
        
        const currDate = new Date();
        const dateCached = new Date(seriesData.dateCached);
        const daysSinceCached = this.daysBetween(currDate, dateCached);
        
        if (daysSinceCached > this.maxValidDays) return; // return nothing if expired

        return seriesData as T;
    }

    cacheData(file: string, data: T, dir: string = 'cache') {
        const _data = {dateCached: new Date(), ...data};
        this.fsEditor.makeDirectory(dir);
        this.fsEditor.writeToFile(`${dir}/${file}.yml`, YAML.stringify(_data));
    }

    private daysBetween(date1: Date, date2: Date) {
        return Math.round((date1.getTime() - date2.getTime())/(1000*60*60*24));
    }
}

export default Cacher;