import Path from 'path';

import { DirTree } from '../Adapters/DirTreeCreator';
import { FSEditor } from '../Adapters/FSEditor';
import FilePurger from './DirManager/FilePurger';
import ffmpeg from '../Adapters/ffmpeg';

import RussianFetcher from '../FilmScrapper/russian/RussianFetcher';
import { EnglishFetcher } from '../FilmScrapper/omdb';
import Fetcher from '../FilmScrapper/fetcher';
import CreationManager from '../../database/CreationManager';
import { download } from '../Adapters/HTTPReq';
import Tree from '../Tree/Tree';
import DirSnapshot from './DirSnapshot';


class MovieOrginizer {
    private readonly GLOBAL_EXCLUDE = /.DS_Store|purge|rejected|dirSnapshot.yaml/;

    private get factory() {
        return {
            createFSEditor: () => new FSEditor(),
            createDirTree: () => new DirTree(),
            createVideoProcessor: () => new ffmpeg(),
            createFilePurger: () => new FilePurger(new FSEditor()),
            createFetcher: (language: string): Fetcher => {
                if (language === 'ru') return new RussianFetcher();
                if (language === 'en') return new EnglishFetcher();
                return new EnglishFetcher();
            }
        };
    }

    /**
     * @param path to the movies folder
    */
    orginizeMovies(path: string, language: string) {
        const beforeDirectory = DirSnapshot.loadDirectoryStateFromFile(path);

        if (beforeDirectory) {
            console.log([`No changes in '${language}' movie directory`]);
        } else {
            console.log();
            console.log(`Orginizing '${language}' movies`);
            const moviesFolder = this.factory.createDirTree().treeFrom(path, this.GLOBAL_EXCLUDE);

            const files = moviesFolder.children.filter(node => node.isFile);
            const folders = moviesFolder.children.filter(node => node.isFolder);

            const purgeFolders = folders.filter(folder => !this.orgMovie(folder.path, language));

            this.purgeFiles(path, [...files, ...purgeFolders]);

            DirSnapshot.saveDirectoryStateOnDisk(path, this.GLOBAL_EXCLUDE);
        }
    }

    private purgeFiles(pathToMovies: string, files: Tree[]) {
        const filePurger = this.factory.createFilePurger();
        filePurger.insertPaths(files.map(x => x.path));
        filePurger.purge(`${pathToMovies}/purge`);
    }

    /**
     * @param path to the movie folder (ex: public/en/movies/joker)
    */
    private orgMovie(path: string, language: string) {
        const log = console.log;
        const movieName = Path.basename(path);

        const { pathToVideo, error } = this.moveUpAndRename(path);
        if (error) return (log(error), false);
        
        this.purge(path, pathToVideo);

        const {duration, error: err } = this.getDuration(pathToVideo);
        if (err) return (log(err), false);
        
        const { movieData, error: err2 } = this.fetchMovieData(path, movieName, language);
        if (err2) log(err2);
      
        log('Adding to database...');
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
            log(`----- Error adding ${movieName} to the database -----`);
            log(error);
            log(`-----------------------------------------------------`);
        });

        return true;
    }

    private fetchMovieData(path: string, movieName: string, language: string) {
        const fetcher = this.factory.createFetcher(language);
        const movieData = fetcher.fetchMovie(movieName);
        
        if (!movieData) return { movieData: undefined, error: `Error: cannot find information on '${movieName}' movie` };
        
        if (movieData.poster) movieData.poster = download(movieData.poster, `${path}/poster`);
        
        return { movieData: movieData, error: undefined };
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

        filePuger.insertPaths(purgableFiles);
        filePuger.purge(`${pathToMovie}/purge`);
    }

}

export default MovieOrginizer;