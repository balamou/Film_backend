import { FileSystemEditor } from "../../Adapters/FSEditor";
import YAML from 'yaml';

class Cacher<T> {
    private fsEditor: FileSystemEditor

    constructor(fsEditor: FileSystemEditor) {
        this.fsEditor = fsEditor
    }

    retrieveCachedData(file: string, dir: string = 'cache') {
        const cachedFile = `${dir}/${file}.yml`;

        if (!this.fsEditor.doesFileExist(cachedFile)) return;
        
        const cachedData = this.fsEditor.readFile(cachedFile);
        const seriesData = YAML.parse(cachedData) as T & { dateCached: Date };
        
        // console.log(seriesData.dateCached);
        // const date = new Date(seriesData.dateCached);
        // const timeDiff = (new Date()).getTime() - date.getTime();
        // console.log(timeDiff/(1000 * 60));

        return seriesData as T;
    }

    cacheData(file: string, data: T, dir: string = 'cache') {
        const _data = {dateCached: new Date(), ...data}
        this.fsEditor.makeDirectory(dir);
        this.fsEditor.writeToFile(`${dir}/${file}.yml`, YAML.stringify(_data));
    }
}

export default Cacher;