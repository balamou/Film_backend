import Tree from '../Tree/Tree';
import Factory from './Factory';
import { DirectoryTreeCreator } from '../Adapters/DirTreeCreator';
import Path from 'path';

class Orginizer {
    protected readonly NETWORK_ENABLED = true;
    protected readonly DATABASE_ENABLED = true;
    private readonly exclude: RegExp;
    protected readonly language: string;

    protected readonly factory: Factory;
    private readonly dirTree: DirectoryTreeCreator;

    protected readonly purgeFolder: string = 'purge';

    constructor(language: string, factory: Factory, exclude: RegExp) {
        this.exclude = exclude;
        this.language = language;

        this.factory = factory;
        this.dirTree = this.factory.createDirTreeCreator();
    }

    public orginizeAllSeries(path: string) {
        const result = this.separateFoldersFromFiles(path);
        const folders = result.folders.map(folder => folder.path);
        const files = result.files.map(file => file.path)

        const purger = this.factory.createFilePurger();
        purger.insertPaths(files);
        purger.purge(`${path}/${this.purgeFolder}`);

        folders.forEach(folder => this.orginizeSeriesFolder(folder));
    }
    
    /**
     * Reorginizes the series structure. 
     * Fetches the series information and commits it to the database.
     * 
     * @param path to the series
     * @param seriesName optional series name (could be entered by the user)
    */
    public orginizeSeriesFolder(path: string, seriesName?: string) {
        const log = console.log;
        seriesName = seriesName ?? Path.basename(path);

        // TODO: do base check if a folder has videos -> if not return
        
        const flatten = this.factory.createFlattenFileTree();
        const vtParser = this.factory.createVirtualTreeParser(this.language);
        const dbManager = this.factory.createDatabaseManager(this.language); 
        
        flatten.flatten(path);
        const virtualTree = this.buildVirtualTree(path);
        vtParser.generateThumbnails(virtualTree);
        
        if (this.NETWORK_ENABLED) {
            log(`Fetching ${seriesName} information`);
            const seriesInfo = vtParser.getSeriesInformation(path, seriesName, virtualTree);
            
            if (this.DATABASE_ENABLED) {
                log(`Adding ${seriesName} to the database`);
                try {
                    dbManager.commitToDB(path, seriesName, seriesInfo);
                } catch (error) {
                    log(error);
                }
                log(`Done adding to the database`);
            }
        }
    }
    
    private buildVirtualTree(path: string) {
        const { folders, files } = this.separateFoldersFromFiles(path);
        
        const vtBuilder = this.factory.createVirtualTreeBuilder();
        vtBuilder.buildVirtualTreeFromFiles(files);
        vtBuilder.buildVirtualTreeFromFolders(folders);
        vtBuilder.commit(path);
        
        return vtBuilder.virtualTree;
    }
    
    // ------------------------------------------------------------------------
    // MARK: Utility Method
    // ------------------------------------------------------------------------
    private separateFoldersFromFiles(path: string) {
        const tree = this.dirTree.treeFrom(path, this.exclude);
        const folders: Tree[] = [];
        const files: Tree[] = [];

        tree.children.forEach(node => {
            if (node.isFolder)
                folders.push(node);
            
            if (node.isFile)
                files.push(node);
        });

        return {
            folders: folders,
            files: files
        };
    }
}

export default Orginizer;