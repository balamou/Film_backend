import { FileSystemEditor } from "./Adapters/FSEditor";
import { Difference } from './Tree/DiffTrees';
import DatabaseManager from "../database/DatabaseManager";


class ExecuteDifference {

    private readonly fsEditor: FileSystemEditor;
    private readonly dbManager: DatabaseManager;
    
    constructor(fsEditor: FileSystemEditor) {
        this.fsEditor = fsEditor;
        this.dbManager = new DatabaseManager(); // TODO?: Dependency injection
    }

    // Instructions

    // d[SERIES] remove from DB
    // a[SERIES] do a hard reload (Assumption -> all files are purged before this method executes)
    // m[see below] add logic to handle this

    //      d[SEASON, POSTER] if poster deleted => refetch. If season deleted => remove from DB
    //      a[FOLDER(season/purge), FILE(video/purge)] if folder added => parse season, extract thumbs & add to db. if file added => check if file video then accumulate them into a season/seasons, else purge
    //      m[SEASON see below] add logic to handle episode removal/addition

    //          d[EPISODE, THUMBNAILS]: if video file => remove Episode from database, if thumbnails folder then regenerate thumbnails for each episode
    //          a[FOLDER(purge), FILE(video, purge)]: if video added => parse Episode information from title, scrape thumbs, parse from imdb, else purge
    //          m[THUMBAILS see below] Contents modified: add logic to handle each thumbnail removal

    //              Deleted: regenerate thumbnail if possible
    //              Added: purge
    execute(difference: Difference) {
        difference.deleted.forEach(node => {
            const seriesFolder = node.path;
            this.dbManager.deleteSeries(seriesFolder);
        });

        difference.modified.forEach(diff => {
            const seriesFolder = diff.parent.path;

            diff.deleted.forEach(node => {
                if (node.name === 'poster.jpeg') {
                    // refetch poster
                    // use parser and get poster based on series name from the series folder
                } else {
                    let matched = node.name.match(/\d+/);

                    if (!matched) return; // Weird: Folder with no number

                    const seasonNumber = parseInt(matched[0]);

                    this.dbManager.removeSeason(seriesFolder, seasonNumber);
                }
            });
        });

        this.dbManager.endConnection(); // async 
    }

}

export default ExecuteDifference;