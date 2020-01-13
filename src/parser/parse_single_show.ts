import Tree from './Tree/Tree';
import Factory from './Orginizer/Factory';
import { DirectoryTreeCreator } from './Adapters/DirTreeCreator';
import Path, { basename } from 'path';
import OrginizerFactory from './Orginizer/Factory';

class ShowOrginizer {
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
    
    /**
     * Reorginizes the series structure. 
     * Fetches the series information and commits it to the database.
     * 
     * @param path to the series
     * @param seriesName optional series name (could be entered by the user)
    */
    public orginizeSeriesFolder(path: string, enter: (stage: string) => any, shouldContinue: (stage: string, example: string) => boolean) {
        const log = console.log;
        const basename = Path.basename(path);

        // TODO: do base check if a folder has videos -> if not return
        
        const flatten = this.factory.createFlattenFileTree();
        const vtParser = this.factory.createVirtualTreeParser(this.language);
        const dbManager = this.factory.createDatabaseManager(this.language); 
        
        log('Flattening the file directory.');
        flatten.flatten(path);
        log('Building a virtual tree.');
        const virtualTree = this.buildVirtualTree(path, shouldContinue);
        if (!virtualTree) return;
        
        if (1===1) return;
        
        log('Generating thumbnails.');
        vtParser.generateThumbnails(virtualTree);
        
        if (this.NETWORK_ENABLED) {
            log(`Fetching ${basename} information`);
            const seriesInfo = vtParser.getSeriesInformation(path, basename, virtualTree);
            
            if (this.DATABASE_ENABLED) {
                log(`Adding ${basename} to the database`);
                try {
                    dbManager.commitToDB(path, basename, seriesInfo);
                } catch (error) {
                    log(error);
                }
                log(`Done adding to the database`);
            }
        }
    }
    
    private buildVirtualTree(path: string, shouldContinue: (stage: string, example: string) => boolean) {
        const { folders, files } = this.separateFoldersFromFiles(path);
        
        const vtBuilder = this.factory.createVirtualTreeBuilderPrompt();

        let keepGoing: boolean | undefined = undefined;
        const wrapper = (stage: string, example: string) => {
            keepGoing = shouldContinue(stage, example);
            return keepGoing;
        };

        vtBuilder.buildVirtualTreeFromFilesPrompt(files, wrapper);
        if (keepGoing === false) return;
        vtBuilder.buildVirtualTreeFromFoldersPrompt(folders, wrapper);
        if (keepGoing === false) return;
        
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

function parseSingleShow(language: string, pathToShow: string) {
    const GLOBAL_EXCLUDE = /.DS_Store|purge|rejected/;
    const showOrginizer = new ShowOrginizer(language, new OrginizerFactory(), GLOBAL_EXCLUDE);
    const prompt = require('prompt-sync')({sigint: true});

    showOrginizer.orginizeSeriesFolder(pathToShow, (stage: string) => {
        if (stage === 'enter show name') {
            const name = prompt('Enter the name of the show: ');
            return name;
        }
    }, (stage: string, example: string) => {
        if (stage === 'Parsing files') {
            console.log();
            console.log('Parsing files');
            console.log(`${example}`);
            console.log();
            return yesNoQuestion('Do you want to continue? [Y/N]: ');
        }

        if (stage === 'Parsing folders') {
            console.log();
            console.log('Parsing folders');
            console.log(`${example}`);
            console.log();
            return yesNoQuestion('Do you want to continue? [Y/N]: ');
        }
        return false;
    });
}

function yesNoQuestion(question: string) {
    const prompt = require('prompt-sync')({sigint: true});

    let answer = prompt(question) as string;
    answer = answer.toLowerCase();
    
    while (!(answer === 'y' || answer === 'n')) {
        console.log("Please answer Y (yes) or N (no)");
        answer = prompt(question) as string;
        answer = answer.toLowerCase();
    }

    if (answer === 'y') {
        return true;
    }

    return false;
}

export default parseSingleShow;