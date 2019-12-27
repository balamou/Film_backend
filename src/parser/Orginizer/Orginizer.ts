import Tree from '../Tree/Tree';
import Factory from './Factory';
import { DirectoryTreeCreator } from '../Adapters/DirTreeCreator';
import Path from 'path';

class Orginizer {
    private readonly NETWORK_ENABLED = true;
    private readonly DATABASE_ENABLED = true;
    private readonly exclude: RegExp;
    private readonly language: string;

    private readonly factory: Factory;
    private readonly dirTree: DirectoryTreeCreator;

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
        purger.purge(`${path}/purge`);

        folders.forEach(folder => this.orginizeSeriesFolder(folder));
    }
    
    public orginizeSeriesFolder(path: string, seriesName?: string) {
        const log = console.log;
        seriesName = seriesName ?? Path.basename(path);

        // TODO: do base check if a folder has videos -> if not return
        
        const flatten = this.factory.createFlattenFileTree();
        const vtParser = this.factory.createVirtualTreeParser();
        const dbManager = this.factory.createDatabaseManager(); 
        
        flatten.flatten(path);
        const virtualTree = this.buildVirtualTree(path);
        vtParser.generateThumbnails(virtualTree);
        
        if (this.NETWORK_ENABLED) {
            log(`Fetching ${seriesName} information`);
            const seriesInfo = vtParser.getSeriesInformation(path, seriesName, virtualTree);
            
            if (this.DATABASE_ENABLED) {
                log(`Adding ${seriesName} to the database`);
                dbManager.commitToDB(path, seriesName, seriesInfo);
                log(`Done adding to the database`);
            }
        }
    }
    
    private buildVirtualTree(path: string) {
        const { folders, files } = this.separateFoldersFromFiles(path);
        
        const vtBuilder = this.factory.createVirtualTreeBuilder();
        vtBuilder.buildVirtualTree(files);
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

        tree.levelOrderTraversal((node, level) => {
            if (level == 1 && node.isFolder)
                folders.push(node);

            if (level == 1 && node.isFile)
                files.push(node);
        });

        return {
            folders: folders,
            files: files
        };
    }
}

export default Orginizer;