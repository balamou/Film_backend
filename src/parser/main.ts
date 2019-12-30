import Facade from './Facade';
import { DirTree } from './Adapters/DirTreeCreator';
import { FSEditor } from './Adapters/FSEditor';
import Path from 'path';

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
    const fsEditor = new FSEditor();

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

    videoPath = rename(videoPath, 'movie');

    // const moviesFolder2 = new DirTree().treeFrom(path, GLOBAL_EXCLUDE);


    // Get tree
    // BFS find first video
    //  move it up & rename
    // generate thumbnail
    // purge the rest
    // fetch info
    // add to db
    // save diff
}

/**
 * Renames the file keeping the current extension.
 * Example path = `a/b/c.mkv`, newName = `episode_1` returns `a/b/episode_1.mkv`.
 * 
 * `TODO` Move to FSEditor
*/
function rename(path: string, newName: string) {
    const fsEditor = new FSEditor();
    const pathData = Path.parse(path);
    const newPath = `${pathData.dir}/${newName}${pathData.ext}`;

    fsEditor.moveAndRename(path, newPath);
    
    return newPath;
}