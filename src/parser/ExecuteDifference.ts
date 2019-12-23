import { FileSystemEditor } from "./Adapters/FSEditor";
import { Difference } from './Tree/DiffTrees';


class ExecuteDifference {

    private readonly fsEditor: FileSystemEditor;

    constructor(fsEditor: FileSystemEditor) {
        this.fsEditor = fsEditor;
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
            const series = node.name;
            
        });


    }
}

export default ExecuteDifference;