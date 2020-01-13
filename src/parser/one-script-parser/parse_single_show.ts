import Tree from '../Tree/Tree';
import Factory from '../Orginizer/Factory';
import { DirectoryTreeCreator } from '../Adapters/DirTreeCreator';
import Path, { basename } from 'path';
import OrginizerFactory from '../Orginizer/Factory';
import chalk from 'chalk';
import { table } from 'table';
   
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
    public orginizeSeriesFolder(path: string, enter: (stage: string) => string | undefined, shouldContinue: (stage: string, example: string) => boolean) {
        const log = console.log;
        const basename = Path.basename(path);

        // TODO: do base check if a folder has videos -> if not return
        
        const flatten = this.factory.createFlattenFileTree();
        const vtParser = this.factory.createVirtualTreeParser(this.language);
        const dbManager = this.factory.createDatabaseManager(this.language); 
        
        log(chalk.bold('Flattening the file directory...'));
        flatten.flatten(path);
        log(chalk.bold('Building a virtual tree...'));
        const virtualTree = this.buildVirtualTree(path, shouldContinue);

        if (!virtualTree) return;
        
        log(chalk.bold('Generating thumbnails...'));
        vtParser.generateThumbnails(virtualTree);
        
        let seriesName = enter('Enter show name');
        seriesName = seriesName === undefined ? basename : seriesName;
        log(seriesName);

        if (1===1) return;

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
    
    private buildVirtualTree(path: string, shouldContinue: (stage: string, example: string) => boolean) {
        const log = console.log;
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
        
        const renameTable = vtBuilder.renameTable(path);
        const rejectTable = vtBuilder.rejectedList();
        
        log(table(renameTable));
        log(table(rejectTable));
        
        if (!shouldContinue('Rename files', '')) return;
        
        vtBuilder.commit(path);

        log();
        log(chalk.bold('Committing virtual tree to the file system (renaming episodes and matching season folders)...'));
        log();
        
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
        if (stage === 'Enter show name') {
            const name = prompt('Enter the name of the show: ') as string;
            if (name.length == 0) return;

            return name;
        }

        return;
    }, shouldContinue);
}

function shouldContinue(stage: string, example: string) {
    const log = console.log;

    if (stage === 'Parsing files') {
        log();
        log(chalk.greenBright('Parsing files'));
        log(`${example}`);
        log();
        log('Those changes have not been commited to the filesystem.');
        log('The next step is parsing folder names.\n');
        return yesNoQuestion('Do you want to continue? [Y/N]: ');
    }

    if (stage === 'Parsing folders') {
        log();
        log(chalk.greenBright('Parsing folders'));
        log(`${example}`);
        log();
        log('Those changes have not been commited to the filesystem.');
        log('Next step is showing video file names before and after.\n');
        return yesNoQuestion('Do you want to continue? [Y/N]: ');
    }

    if (stage === 'Rename files') {
        const linkToPythonScript = 'https://gist.github.com/balamou/41f4493d7e25d0b7bce33ab2736cd4cc';

        log('The table above shows the new names of each file.');
        log(`Those changes are ${chalk.red.bold('NOT')} commited on the filesystem yet.`);
        log();
        log('If you are not satisfied with the parsing results you can manually rename');
        log(`them using ${chalk.bgBlue.black(linkToPythonScript)}`);
        log();
        return yesNoQuestion('Do you want to commit them? [Y/N]: ', false);
    }

    return false;
}

function yesNoQuestion(question: string, enableEnterAsYes: boolean = true) {
    const prompt = require('prompt-sync')({sigint: true});

    let answer = prompt(question) as string;
    answer = answer.toLowerCase();
    
    if (answer.length === 0 && enableEnterAsYes === true) return true;

    while (!(answer === 'y' || answer === 'n')) {
        console.log("Please answer Y (yes) or N (no)");
        answer = prompt(question) as string;
        answer = answer.toLowerCase();

        if (answer.length === 0 && enableEnterAsYes === true) return true;
    }

    if (answer === 'y') {
        return true;
    }

    return false;
}

export default parseSingleShow;