import Path from 'path';

import { DirTree } from '../Adapters/DirTreeCreator';
import { FSEditor } from '../Adapters/FSEditor';
import FilePurger from '../Orginizer/DirManager/FilePurger';
import ffmpeg from '../Adapters/ffmpeg';

import RussianFetcher from '../FilmScrapper/russian/RussianFetcher';
import { EnglishFetcher } from '../FilmScrapper/omdb';
import Fetcher from '../FilmScrapper/fetcher';
import CreationManager from '../../database/CreationManager';
import { download } from '../Adapters/HTTPReq';
import DatabaseManager from '../../database/DatabaseManager';
import Prompt from './prompt';

import chalk from 'chalk';
import { table } from 'table';

type Context = ((stage: string, data: any) => any);

class MovieOrginizer {
    private readonly GLOBAL_EXCLUDE = /.DS_Store|purge|rejected|dirSnapshot.yaml/;

    private get factory() {
        return {
            createFSEditor: () => new FSEditor(),
            createDirTree: () => new DirTree(),
            createVideoProcessor: () => new ffmpeg(),
            createFilePurger: () => new FilePurger(new FSEditor()),
            createDBManager: () => new DatabaseManager(),
            createFetcher: (language: string): Fetcher => {
                if (language === 'ru') return new RussianFetcher();
                if (language === 'en') return new EnglishFetcher();
                return new EnglishFetcher();
            }
        };
    }

    /**
     * @param path to the movie folder (ex: public/en/movies/joker)
     * @param _context the context is sent to know about which stage the method is in and send in 
     * inputs from the user or output data from the function
    */
    orgMovie(path: string, language: string, _context?: Context) {
        const movieName = Path.basename(path);
        const context = (stage: string, data: any) => { if (_context) _context(stage, data); }; // unwrap the context (same as context?(...) in swift)
        const reportError = (error?: string) => { if (error) context('error', error)};

        const { pathToVideo, error: err1 } = this.moveUpAndRename(path);
        reportError(err1);
        context('path to video', pathToVideo);

        const { duration, error: err2 } = this.getDuration(pathToVideo);
        reportError(err2);
        context('duration', duration);
        
        this.purge(path, pathToVideo, context);
        
        const movieData = this.fetchMovieData(path, movieName, language, _context);
      
        const databaseEntry = {
            language: language,
            duration: duration,
            videoURL: pathToVideo.replace(/public\//, ''),
            folder: path,
            title: movieData?.title ?? movieName,
            description: movieData?.plot?.substring(0, 400),
            poster: movieData?.poster?.replace(/public\//, '')
        };

        context("database", databaseEntry);

        const cManager = new CreationManager();
        cManager.createMovie(databaseEntry).catch(error => {
           context("db error", error);
        });

        return true;
    }

    private fetchMovieData(path: string, movieName: string, language: string, _context?: Context) {
        const context = (stage: string, data: any): any => { if (_context) return _context(stage, data); }; // unwrap the context (same as context?(...) in swift)
        const fetcher = this.factory.createFetcher(language);

        let selectedMovieName = _context ? _context('pick movie name', movieName) as string: movieName;
        let movieData = this.tryOrUndefined(() => fetcher.fetchMovie(selectedMovieName));

        while (!movieData) {
            context('log', `Unable to find data for ${chalk.red(selectedMovieName)}`);
            const shouldContinue = context('ask', 'Do you want to enter a different name? [Y/n] ') as boolean;

            if (!shouldContinue) return undefined;

            selectedMovieName = context('pick another movie name', undefined) as string;

            movieData = this.tryOrUndefined(() => fetcher.fetchMovie(selectedMovieName));
        }
        
        context("movie info", movieData);

        if (movieData.poster && movieData.poster != "N/A")
            movieData.poster = download(movieData.poster, `${path}/poster`);
        else
            context("log", chalk.bgRed.black("Movie poster not found"));
        
        return movieData;
    }

    private tryOrUndefined<T>(callback: () => T) {
        try {
            return callback();
        } catch {
            return;
        }
    }

    private getDuration(videoPath: string) {
        const videoProcessor = this.factory.createVideoProcessor();
        const duration = videoProcessor.getDuration(videoPath);

        if (!duration) return { duration: NaN, error: `Error! Duration cannot be extracted from '${videoPath}'`};
        
        return { duration: duration, error: undefined};
    }   

    /**
     * Finds the first video using BFS in the dir folder and moves it up to level 1.
     * 
     * @param pathToMovie path to the movie folder (ex. public/en/movies/iron_man)
    */
    private moveUpAndRename(pathToMovie: string) {
        const moviesFolder = this.factory.createDirTree().treeFrom(pathToMovie, this.GLOBAL_EXCLUDE);
        const fsEditor = this.factory.createFSEditor();

        const video = moviesFolder.find(node => node.isVideo);
        
        if (!video) return { pathToVideo: 'undefined', error: `No videos found in '${pathToMovie}'`};

        const [videoFile, level] = video;
        let videoPath = videoFile.path;

        if (level !== 1) {
            const newPath = fsEditor.moveFileToLevel(videoFile.path, level, 1);

            if (!newPath) return { pathToVideo: 'undefined', error: `Error occured moving '${videoFile.path}' to top level` };

            videoPath = newPath;
        }

        videoPath = fsEditor.rename(videoPath, 'movie');
        return { pathToVideo: videoPath, error: undefined };
    }

    private purge(pathToMovie: string, videoFilePath: string, context?: Context) {
        const folder = this.factory.createDirTree().treeFrom(pathToMovie, this.GLOBAL_EXCLUDE);
        const filePuger = this.factory.createFilePurger();
        const videoName = Path.basename(videoFilePath);

        const purgableFiles = folder.children.filter(node => node.name !== videoName).map(node => node.path);

        if (context) context('purging', purgableFiles);

        filePuger.insertPaths(purgableFiles);
        filePuger.purge(`${pathToMovie}/purge`);
    }

}

function secondsToHms(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 3600 % 60);

    const hDisplay = h > 0 ? h + (h == 1 ? " hour " : " hours ") : "";
    const mDisplay = m > 0 ? m + (m == 1 ? " minute " : " minutes ") : "";
    const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";

    return hDisplay + mDisplay + sDisplay; 
}

function contextExecution(stage: string, data: any) {
    const prompt = new Prompt();
    const log = console.log;

    if (stage === 'error') {
        log();
        log(chalk.red(data));
        log();

        const shouldContinue = prompt.yesNoQuestion("Do you want to continue? [Y/n] ");
        if (!shouldContinue) exit();
    }

    if (stage === 'log') {
        log(data);
    }

    if (stage === 'ask') {
        return prompt.yesNoQuestion(data);
    }

    if (stage === 'pick another movie name') {
        log();
        const movieName = prompt.ask("Please enter another movie name: ");
        
        return movieName.replace(/(\s)+/g, " ").trim();
    }

    if (stage === 'path to video') {
        log(`The path to the movie is ${chalk.bgBlue.black(data)}`);

        const shouldContinue = prompt.yesNoQuestion("Do you want to continue? [Y/n] ");

        if (!shouldContinue) exit();
    }

    if (stage === 'duration') {
        log();
        const duration = data as number;
        log(`Calculated movie duration is ${chalk.green(secondsToHms(duration))}`);
        log();
        const shouldContinue = prompt.yesNoQuestion("Do you want to continue with this duration? [Y/n] ");

        if (!shouldContinue) exit();
    }

    if (stage === 'purging') {
        log();

        if (data.length > 0 ) {
            log("The following files are due to be purged:");
            log(data);
            log();
            const shouldContinue = prompt.yesNoQuestion("Do you want to purge them? [Y/n] ");

            if (!shouldContinue) exit();
        } else {
            log("No files found to purge.");
            log(chalk.green("Continuing..."));
        }
    }

    if (stage === 'pick movie name') {
        log();
        log(`The movie name extracted form the folder name is ${chalk.blue(data)}`);
        const shouldContinue = prompt.yesNoQuestion(`Do you want continue with ${chalk.blue(data)}? [Y/n] `);
        
        if (shouldContinue) return data;

        log();
        const movieName = prompt.ask("Please enter the movie name: ");
        
        return movieName.replace(/(\s)+/g, " ").trim();
    }

    if (stage === 'movie info') {
        log();
        log('Movie info extracted: ');
        log(data);
    }

    if (stage === 'database') {
        let config = { columns: { 0: { width: 20 }, 1: { width: 50 } } };
        const dbEntriesTable = Object.entries(data).map(([key, value]) => [key, value]);
        
        log();
        log(table(dbEntriesTable, config));

        const shouldContinue = prompt.yesNoQuestion("Do you want to commit to the database? [y/n] ", false);

        if (!shouldContinue) exit();

        log();
        log("Adding to the database...");
    }

    if (stage === 'db error') {
        log(`----- ${chalk.red("Error adding to the database")} -----`);
        log(data);
        log(`----------------------------------------`);
    }
}

function exit() {
    throw new Error("Stop flow execution");    
}

function parseSingleMovie(language: string, pathToMovie: string) {
    try {
        const movieOrginizer = new MovieOrginizer();
        movieOrginizer.orgMovie(pathToMovie, language, contextExecution);
    } catch(e) {
        if (e.message == "Stop flow execution")
            console.log("Stopping...");
        else 
            console.log(e);
    }
}


export default parseSingleMovie;