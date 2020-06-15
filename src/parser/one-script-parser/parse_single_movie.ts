import Path from 'path';

import MovieOrginizerFactory from './MovieOrginizerFactory';
import CreationManager from '../../database/CreationManager';
import { download } from '../Adapters/HTTPReq';

import chalk from 'chalk';
import MovieContext from './MovieContext';

class MovieOrginizer {
    private readonly GLOBAL_EXCLUDE = /.DS_Store|purge|rejected|dirSnapshot.yaml/;
    private factory: MovieOrginizerFactory;
    private context?: MovieContext;

    /**
     * @param context the context has methods that correspond to stages in the function. 
     * Those stages allow to transfer inputs in and out of the function as well as interupt 
     * the flow of the function. It is an optional dependency.
     */
    constructor(factory: MovieOrginizerFactory, context?: MovieContext) {
        this.factory = factory;
        this.context = context;
    }

    /**
     * @param path to the movie folder (ex: public/en/movies/joker)
    */
    orgMovie(path: string, language: string) {
        const movieName = Path.basename(path);

        const { pathToVideo, error: err1 } = this.moveUpAndRename(path);
        this.context?.error(err1);

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
    }

    private fetchMovieData(path: string, movieName: string, language: string) {
        const fetcher = this.factory.createFetcher(language);

        let selectedMovieName = this.context?.pickMovieName(movieName) ?? movieName;
        let searchResults = this.tryOrUndefined(() => fetcher.searchResults(selectedMovieName));

        while (!searchResults) {
            const shouldContinue = this.context?.shouldSelectDifferentName(selectedMovieName);

            if (!shouldContinue) return;

            selectedMovieName = this.context?.pickAnotherMovieName() ?? movieName;

            searchResults = this.tryOrUndefined(() => fetcher.searchResults(selectedMovieName));
        }

        const selectedRow = this.context?.selectSearch(fetcher.orginizeSearchResults(searchResults), 0, searchResults.length - 1) ?? 0;
        const imdbID = searchResults[selectedRow].imdbID;
        const movieData = this.tryOrUndefined(() => fetcher.fetchMovie(imdbID));

        if (!movieData) return;

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

        this.context?.pathToVideo(videoPath);
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

function parseSingleMovie(language: string, pathToMovie: string) {
    try {
        const movieOrginizer = new MovieOrginizer(new MovieOrginizerFactory(), new MovieContext());
        movieOrginizer.orgMovie(pathToMovie, language);
    } catch(e) {
        if (e.message == "Stop flow execution")
            console.log("Stopping...");
        else 
            console.log(e);
    }
}


export default parseSingleMovie;