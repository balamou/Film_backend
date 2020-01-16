import Tree from '../Tree/Tree';
import Factory from '../Orginizer/Factory';
import { DirectoryTreeCreator } from '../Adapters/DirTreeCreator';
import Path from 'path';
import OrginizerFactory from '../Orginizer/Factory';
import chalk from 'chalk';
import { table } from 'table';

import EnglishFetcherPrompt from './english_fetcher';
import Prompt from './prompt';
import ora from 'ora';

class ShowOrginizer {
    protected readonly NETWORK_ENABLED = true;
    protected readonly DATABASE_ENABLED = true;
    private readonly exclude: RegExp;
    protected readonly language: string;

    protected readonly factory: Factory;
    private readonly dirTree: DirectoryTreeCreator;

    protected readonly purgeFolder: string = 'purge';
    private readonly prompt = new Prompt();

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
    public orginizeSeriesFolder(path: string, shouldContinue: (stage: string, example: string) => boolean) {
        const log = console.log;
        const basename = Path.basename(path);

        // TODO: do base check if a folder has videos -> if not return
        
        const flatten = this.factory.createFlattenFileTree();
        const vtParser = this.factory.createVirtualTreeParserPrompt();
        const dbManager = this.factory.createDatabaseManagerPrompt(this.language); 
        
        log(chalk.bold('Flattening the file directory...'));
        flatten.flatten(path);
        log(chalk.bold('Building a virtual tree...'));
        const virtualTree = this.buildVirtualTree(path, shouldContinue);

        if (!virtualTree) return;
        
        log(chalk.bold('Generating thumbnails...'));
        vtParser.generateThumbnails(virtualTree);
        
        let seriesInfo = this.selectShowFromIMDB();
        let seriesData = vtParser.seriesData;

        if (!seriesInfo) {
            if (!shouldContinue('No imdb information', '')) return; // Exit
        } else {
            seriesData = vtParser.attachSeriesInfoToVT(path, seriesInfo, virtualTree);
        }

        // DATABASE
        const seriesName = seriesInfo?.seriesInfo?.title ?? basename;

        log();
        log(`Everything ready to be added to the database.`);
        if (!this.prompt.yesNoQuestion(`Do you want to commit data to the database? [Y/N]: `)) {
            return; // Exit
        }

        const spinner = ora(`Adding ${chalk.red(seriesName)} to the database...`).start();
        dbManager.commitToDB(path, seriesName, seriesData)
        .catch(error => log(error))
        .then(() => {
            spinner.text = 'Done adding to the database';
        }).finally(() => {
            spinner.stop();
        });
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

    private selectShowFromIMDB() {
        const fetcher = new EnglishFetcherPrompt();
        const log = console.log;

        const seriesName = this.prompt.ask('Enter the name of the show: ');

        const spinner = ora(`Searching for tv-shows matching ${chalk.red(seriesName)}...`).start();
        const searchResults = fetcher.searchResults(seriesName);
        spinner.stop();

        if (!searchResults) {
            log(`No shows matching ${chalk.red(seriesName)} found`);
            return;
        }

        const searchTable = fetcher.orginizeSearchResults(searchResults);
        log(table(searchTable));

        // SHOW EPISODES -------
        const rowSelected = this.selectNumber(0, searchResults.length);
        const imdbId = searchResults[rowSelected].imdbID;

        spinner.text = `Retrieving ${chalk.red(seriesName)} episodes information...`;
        spinner.start();
        const seriesData = fetcher.retrieveSeriesData(imdbId);
        spinner.stop();

        if (!seriesData) {
            log(`No show information found about ${chalk.red(seriesName)}`);
            return;
        }

        let config = { columns: { 1: { width: 30 }, 2: { width: 55 } } };

        const seriesInfoTable = fetcher.orginizeSeriesInfo(seriesData);
        log(table(seriesInfoTable, config));

        return seriesData;
    }

    private selectNumber(a: number, b: number) {
        const validation = (num: number) => num >= a && num <= b;
        const msg = `Please select a row between ${a} and ${b}: `;
        return this.prompt.enterNumber(msg, validation, `The number has to be between ${a} and ${b}`);
    }
}

function parseSingleShow(language: string, pathToShow: string) {
    const GLOBAL_EXCLUDE = /.DS_Store|purge|rejected/;
    const showOrginizer = new ShowOrginizer(language, new OrginizerFactory(), GLOBAL_EXCLUDE);

    showOrginizer.orginizeSeriesFolder(pathToShow, shouldContinue);
}

function shouldContinue(stage: string, example: string) {
    const log = console.log;
    const prompt = new Prompt();

    if (stage === 'Parsing files') {
        log();
        log(chalk.greenBright('Parsing files'));
        log(`${example}`);
        log();
        log('Those changes have not been commited to the filesystem.');
        log('The next step is parsing folder names.\n');
        return prompt.yesNoQuestion('Do you want to continue? [Y/N]: ');
    }

    if (stage === 'Parsing folders') {
        log();
        log(chalk.greenBright('Parsing folders'));
        log(`${example}`);
        log();
        log('Those changes have not been commited to the filesystem.');
        log('Next step is showing video file names before and after.\n');
        return prompt.yesNoQuestion('Do you want to continue? [Y/N]: ');
    }

    if (stage === 'Rename files') {
        const linkToPythonScript = 'https://gist.github.com/balamou/41f4493d7e25d0b7bce33ab2736cd4cc';

        log('The table above shows the new names of each file.');
        log(`Those changes are ${chalk.red.bold('NOT')} commited on the filesystem yet.`);
        log();
        log('If you are not satisfied with the parsing results you can manually rename');
        log(`them using ${chalk.bgBlue.black(linkToPythonScript)}`);
        log();
        return prompt.yesNoQuestion('Do you want to commit them? [Y/N]: ', false);
    }

    if (stage === 'No imdb information') {
        return prompt.yesNoQuestion('Do you want to add this show to the database without imdb information? [Y/N]: ', false);
    }

    return false;
}



export default parseSingleShow;