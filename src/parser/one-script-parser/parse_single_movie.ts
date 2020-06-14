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
     * @param context the context is sent to know about which stage the method is in and send in 
     * inputs from the user or output data from the function
    */
    orgMovie(path: string, language: string, context?: Context) {
        const log = console.log;
        const logErr = (error: string) => console.log(chalk.red(error));

        const movieName = Path.basename(path);

        const { pathToVideo, error } = this.moveUpAndRename(path);
        if (error) return (logErr(error), false);
        if (context) context('path to video', pathToVideo);

        const { duration, error: err } = this.getDuration(pathToVideo);
        if (err) return (logErr(err), false);
        if (context) context('duration', duration);
        
        this.purge(path, pathToVideo, context);
        
        const { movieData, error: err2 } = this.fetchMovieData(path, movieName, language, context);
        if (err2) logErr(err2);
      
        if (context) context("database", undefined);

        const cManager = new CreationManager();
        cManager.createMovie({
            language: language,
            duration: duration,
            videoURL: pathToVideo.replace(/public\//, ''),
            folder: path,
            title: movieData?.title ?? movieName,
            description: movieData?.plot?.substring(0, 400),
            poster: movieData?.poster?.replace(/public\//, '')
        }).catch(error => {
           if (context) context("db error", error);
        });

        return true;
    }

    private fetchMovieData(path: string, movieName: string, language: string, context?: Context) {
        const fetcher = this.factory.createFetcher(language);
        const selectedMovieName = context ? context('pick movie name', movieName) as string: movieName;
        const movieData = this.tryOrUndefined(() => fetcher.fetchMovie(selectedMovieName));
        
        if (!movieData) return { movieData: undefined, error: `Error: cannot find information on '${selectedMovieName}' movie` };
        
        if (context) context("movie info", movieData);

        if (movieData.poster && movieData.poster != "N/A") {
            const posterURL = movieData.poster;
            movieData.poster = download(movieData.poster, `${path}/poster`);

            if (context) context("poster", `Movie poster found at ${chalk.green(posterURL)}`);
        } else {
            if (context) context("poster", chalk.bgRed.black("Movie poster not found"));
        }
        
        return { movieData: movieData, error: undefined };
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

    if (stage == 'path to video') {
        log(`The path to the movie is ${chalk.bgBlue.black(data)}`);

        const shouldContinue = prompt.yesNoQuestion("Do you want to continue? [Y/n] ");

        if (!shouldContinue) exit();
    }

    if (stage == 'duration') {
        log();
        const duration = data as number;
        log(`Calculated movie duration is ${chalk.green(secondsToHms(duration))}`);
        log();
        const shouldContinue = prompt.yesNoQuestion("Do you want to continue with this duration? [Y/n] ");

        if (!shouldContinue) exit();
    }

    if (stage == 'purging') {
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

    if (stage == 'pick movie name') {
        log();
        log(`The movie name extracted form the folder name is ${chalk.blue(data)}`);
        const shouldContinue = prompt.yesNoQuestion(`Do you want continue with ${chalk.blue(data)}? [Y/n] `);
        
        if (shouldContinue) return data;

        log();
        const movieName = prompt.ask("Please enter the movie name: ");
        
        return movieName.replace(/(\s)+/g, " ").trim();
    }

    if (stage == 'movie info') {
        log();
        log('Movie info extracted: ');
        log(data);
    }

    if (stage == 'poster') {
        log();
        log(data)
    } 

    if (stage == 'database') {
        log();

        const shouldContinue = prompt.yesNoQuestion("Do you want to commit to the database? [y/n] ", false);

        if (!shouldContinue) exit();

        log();
        log("Adding to the database...");
    }

    if (stage == 'db error') {
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