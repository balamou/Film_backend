"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Parser module.
// Listens to new files/folders added or removed from the `./public/` folder.
// When a new folder is added it renamed and reorginizes the files, and scraps 
// imdb-like website to get info about the show/movie.
// The information is stored in the database.
const chokidar_1 = __importDefault(require("chokidar"));
const folder_organizer_1 = __importDefault(require("./folder_organizer"));
function runWatcher() {
    // Initialize watcher
    const watcher = chokidar_1.default.watch('./public/', {
        ignored: /(^|[\/\\])\../,
        persistent: false,
        usePolling: true,
        // only 2 levels deep: i.e. 
        //    0      1     2   
        // public / en / shows / 
        depth: 2
    });
    watcher.on('ready', () => {
        console.log('Initial scan complete. Ready for changes');
        watcher.on('add', path => folder_organizer_1.default('add', path))
            .on('change', path => folder_organizer_1.default('change', path))
            .on('unlink', path => folder_organizer_1.default('delete', path))
            .on('addDir', path => folder_organizer_1.default('addDir', path))
            .on('unlinkDir', path => folder_organizer_1.default('unlinkDir', path))
            .on('error', error => console.log(`Watcher error: ${error}`));
    });
}
exports.default = runWatcher;
