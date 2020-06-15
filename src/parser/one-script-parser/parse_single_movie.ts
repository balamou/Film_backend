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
import GeneralContext from './GeneralContext';

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

    private context?: MovieContext;

    /**
     * @param context the context has methods that correspond to stages in the function. 
     * Those stages allow to transfer inputs in and out of the function as well as interupt 
     * the flow of the function. It is an optional dependency.
     */
    constructor(context?: MovieContext) {
        this.context = context;
    }

    /**
     * @param path to the movie folder (ex: public/en/movies/joker)
    */
    orgMovie(path: string, language: string) {
        const movieName = Path.basename(path);

        const { pathToVideo, error: err1 } = this.moveUpAndRename(path);
        this.context?.error(err1);
        this.context?.pathToVideo(pathToVideo);

        const { duration, error: err2 } = this.getDuration(pathToVideo);
        this.context?.error(err2);
        this.context?.duration(duration);
        
        this.purge(path, pathToVideo);
        
        const movieData = this.fetchMovieData(path, movieName, language);
      
        const databaseEntry = {
            language: language,
            duration: duration,
            videoURL: pathToVideo.replace(/public\//, ''),
            folder: path,
            title: movieData?.title ?? movieName,
            description: movieData?.plot?.substring(0, 400),
            poster: movieData?.poster?.replace(/public\//, '')
        };

        this.context?.database(databaseEntry);

        const cManager = new CreationManager();
        cManager.createMovie(databaseEntry).catch(error => {
           context("db error", error);
        });

        return true;
    }

    private fetchMovieData(path: string, movieName: string, language: string) {
        const fetcher = this.factory.createFetcher(language);

        let selectedMovieName = this.context?.pickMovieName(movieName) ?? movieName;
        let movieData = this.tryOrUndefined(() => fetcher.fetchMovie(selectedMovieName));

        while (!movieData) {
            this.context?.logg(`Unable to find data for ${chalk.red(selectedMovieName)}`);
            const shouldContinue = this.context?.ask('Do you want to enter a different name? [Y/n] ');

            if (!shouldContinue) return undefined;

            selectedMovieName = this.context?.pickAnotherMovieName() ?? movieName;

            movieData = this.tryOrUndefined(() => fetcher.fetchMovie(selectedMovieName));
        }
        
        this.context?.movieInfo(movieData);

        if (movieData.poster && movieData.poster != "N/A")
            movieData.poster = download(movieData.poster, `${path}/poster`);
        else
            this.context?.logg(chalk.bgRed.black("Movie poster not found"));
        
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

    private purge(pathToMovie: string, videoFilePath: string) {
        const folder = this.factory.createDirTree().treeFrom(pathToMovie, this.GLOBAL_EXCLUDE);
        const filePuger = this.factory.createFilePurger();
        const videoName = Path.basename(videoFilePath);

        const purgableFiles = folder.children.filter(node => node.name !== videoName).map(node => node.path);

        this.context?.purging(purgableFiles);

        filePuger.insertPaths(purgableFiles);
        filePuger.purge(`${pathToMovie}/purge`);
    }

}


class MovieContext extends GeneralContext {

    public pickAnotherMovieName() {
        this.log();
        const movieName = this.prompt.ask("Please enter another movie name: ");
        
        return this.removeWhiteSpaces(movieName);
    }    

    public pathToVideo(pathToMovie: string) {
        this.log(`The path to the movie is ${chalk.bgBlue.black(pathToMovie)}`);

        const shouldContinue = this.prompt.yesNoQuestion("Do you want to continue? [Y/n] ");

        if (!shouldContinue) this.exit();
    }

    public duration(duration: number) {
        this.log();
        this.log(`Calculated movie duration is ${chalk.green(this.secondsToHms(duration))}`);
        this.log();
        const shouldContinue = this.prompt.yesNoQuestion("Do you want to continue with this duration? [Y/n] ");

        if (!shouldContinue) this.exit();
    }

    public purging(files: string[]) {
        this.log();

        if (files.length > 0 ) {
            this.log("The following files are due to be purged:");
            this.log(files);
            this.log();
            const shouldContinue = this.prompt.yesNoQuestion("Do you want to purge them? [Y/n] ");

            if (!shouldContinue) this.exit();
        } else {
            this.log("No files found to purge.");
            this.log(chalk.green("Continuing..."));
        }
    }

    public pickMovieName(movieFromFolder: string) {
        this.log();
        this.log(`The movie name extracted form the folder name is ${chalk.blue(movieFromFolder)}`);
        const shouldContinue = this.prompt.yesNoQuestion(`Do you want continue with ${chalk.blue(movieFromFolder)}? [Y/n] `);
        
        if (shouldContinue) return movieFromFolder;

        this.log();
        const movieName = this.prompt.ask("Please enter the movie name: ");
        
        return this.removeWhiteSpaces(movieName);
    }

    public movieInfo(movieInfo: any) {
        this.log();
        this.log('Movie info extracted: ');
        this.log(movieInfo);
    }

    // HELPERS

    private removeWhiteSpaces(str: string) {
        return str.replace(/(\s)+/g, " ").trim();
    }

    private secondsToHms(seconds: number) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 3600 % 60);
    
        const hDisplay = h > 0 ? h + (h == 1 ? " hour " : " hours ") : "";
        const mDisplay = m > 0 ? m + (m == 1 ? " minute " : " minutes ") : "";
        const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    
        return hDisplay + mDisplay + sDisplay; 
    }

    public database(data: any) {
        let config = { columns: { 0: { width: 20 }, 1: { width: 50 } } };
        const dbEntriesTable = Object.entries(data).map(([key, value]) => [key, value]);
        
        this.log();
        this.log(table(dbEntriesTable, config));

        const shouldContinue = this.prompt.yesNoQuestion("Do you want to commit to the database? [y/n] ", false);

        if (!shouldContinue) this.exit();

        this.log();
        this.log("Adding to the database...");
    }

    public dbError(error: string) {
        this.log(`----- ${chalk.red("Error adding to the database")} -----`);
        this.log(error);
        this.log(`----------------------------------------`);
    }
}

function parseSingleMovie(language: string, pathToMovie: string) {
    try {
        const movieOrginizer = new MovieOrginizer(new MovieContext());
        movieOrginizer.orgMovie(pathToMovie, language);
    } catch(e) {
        if (e.message == "Stop flow execution")
            console.log("Stopping...");
        else 
            console.log(e);
    }
}


export default parseSingleMovie;