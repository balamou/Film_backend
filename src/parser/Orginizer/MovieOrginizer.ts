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
        console.log();
        console.log(`Orginizing '${language}' movies`);
        const moviesFolder = this.factory.createDirTree().treeFrom(path, this.GLOBAL_EXCLUDE);

        const files = moviesFolder.children.filter(node => node.isFile); // TODO: purge
        const folders = moviesFolder.children.filter(node => node.isFolder);

        folders.forEach(folder => this.orgMovie(folder.path, language));
    }

    /**
     * @param path to the movie folder (ex: public/en/movies/joker)
    */
    private orgMovie(path: string, language: string) {
        const moviesFolder = this.factory.createDirTree().treeFrom(path, this.GLOBAL_EXCLUDE);
        const fsEditor = this.factory.createFSEditor();

        const video = moviesFolder.find(node => node.isVideo);
        if (!video) return console.log(`No videos found in '${path}'`);
        const [videoFile, level] = video;

        console.log(videoFile.path, level);
        let videoPath = videoFile.path;

        if (level !== 1) {
            const newPath = fsEditor.moveFileToLevel(videoFile.path, level, 1);

            if (!newPath) return console.log(`Error occured moving '${videoFile.path}' to top level`);

            videoPath = newPath;
        }

        videoPath = fsEditor.rename(videoPath, 'movie');
        this.purge(path, videoPath);

        const videoProcessor = this.factory.createVideoProcessor();
        const duration = videoProcessor.getDuration(videoPath);

        if (!duration) return console.log(` Error! Duration cannot be extracted from '${videoPath}'. Cancelling '${path}'...`);

        // Fetch ----
        const fetcher = this.factory.createFetcher(language);
        const movieName = Path.basename(path);
        const movieData = fetcher.fetchMovie(movieName);
        let posterPath: string | undefined = undefined;

        if (movieData.poster) {
            // Download poster
            posterPath = download(movieData.poster, `${path}/poster`);
        }

        if (!movieData) console.log(`   Error: cannot find information on '${movieName}' movie`);
        console.log(movieData);

        console.log('Adding to database...');
        const cManager = new CreationManager();
        cManager.createMovie({
            language: language,
            duration: duration,
            videoURL: videoPath.replace(/public\//, ''),
            folder: path,
            title: movieData?.title ?? Path.basename(path),
            description: movieData?.plot?.substring(0, 400),
            poster: posterPath?.replace(/public\//, '')
        }).catch(error => {
            console.log('----------');
            console.log(error);
            console.log('----------');
        });
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