import Facade from './Facade';
import { DirTree } from './Adapters/DirTreeCreator';

const paths = { // TODO: move those paths into a config file
    shows: [{ language: 'en', path: 'public/en/shows' }, { language: 'ru', path: 'public/ru/shows' }], 
    movies: [{ language: 'en', path: 'public/en/movies' }, { language: 'ru', path: 'public/ru/movies' }]
};

export default function main() {
    paths.shows.forEach(x => Facade.bulkSeriesRefresh(x.path, x.language));
    paths.movies.forEach(x => orginizeMovies(x.path, x.language));
}

const GLOBAL_EXCLUDE = /.DS_Store|purge|rejected|dirSnapshot.yaml/;
/**
 * @param path to the movies folder
*/
function orginizeMovies(path: string, language: string) {
    const moviesFolder = new DirTree().treeFrom(path, GLOBAL_EXCLUDE);

    const files = moviesFolder.children.filter(node => node.isFile); // TODO: purge
    const folders = moviesFolder.children.filter(node => node.isFolder);

    folders.forEach(folder => orgMovie(folder.path, language));
}

function orgMovie(path: string, language: string) {
    const moviesFolder = new DirTree().treeFrom(path, GLOBAL_EXCLUDE);

    const video = moviesFolder.find(node => node.isVideo);

    if (!video) return console.log(`No videos found in '${path}'`);
    const [videoFile, level] = video;

    console.log(videoFile.path, level);

    // Get tree
    // BFS find first video
    //  move it up & rename
    // generate thumbnail
    // purge the rest
    // fetch info
    // add to db
    // save diff
}