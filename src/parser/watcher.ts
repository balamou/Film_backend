// Parser module.
// Listens to new files/folders added or removed from the `./public/` folder.
// When a new folder is added it renamed and reorginizes the files, and scraps 
// imdb-like website to get info about the show/movie.
// The information is stored in the database.
import chokidar from 'chokidar';
// import folderOrginizer from './folder_organizer';

function runWatcher() { 
    // Initialize watcher
    const watcher = chokidar.watch('./public/', {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: false,
        usePolling: true,
        // only 2 levels deep: i.e. 
        //    0      1     2   
        // public / en / shows / 
        depth: 2
    });
    
    watcher.on('ready', () => {
        console.log('Initial scan complete. Ready for changes');
    
        watcher.on('add', path => folderOrginizer('add', path))
            .on('change', path => folderOrginizer('change', path))
            .on('unlink', path => folderOrginizer('delete', path))
            .on('addDir', path => folderOrginizer('addDir', path))
            .on('unlinkDir', path => folderOrginizer('unlinkDir', path))
            .on('error', error => console.log(`Watcher error: ${error}`));
    });
}

function folderOrginizer(a: string, b: string) {
    console.log(`${a} -- ${b}`);
}

export default runWatcher;