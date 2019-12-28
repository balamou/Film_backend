import { FileSystemEditor } from "./Adapters/FSEditor";
import { Difference } from './Tree/TreeDifference';
import DatabaseManager from "../database/DatabaseManager";
import Tree from "./Tree/Tree";


class ExecuteDifference {
    private readonly fsEditor: FileSystemEditor;
    private readonly dbManager: DatabaseManager;
    private hardReload: (seriesPath: string) => void;
    
    constructor(fsEditor: FileSystemEditor, hardReload: (seriesPath: string) => void) {
        this.fsEditor = fsEditor;
        this.dbManager = new DatabaseManager(); // TODO?: Dependency injection
        this.hardReload = hardReload;
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
        difference.levelOrderTraversal((level: number, parent: Tree, deleted: Tree[], added: Tree[]) => {
            switch (level) {
                case 0:
                    this.levelOchange(parent, deleted, added);
                break;
                case 1:
                    this.level1change(parent, deleted, added);
                break;
                case 2:
                    this.level2change(parent, deleted, added);
                break;
                case 3:
                    this.level3change(parent, deleted, added);
                break;
            }
        });
        
        this.dbManager.endConnection(); // async 
    }

    levelOchange = (parent: Tree, deleted: Tree[], added: Tree[]) => {
        deleted.forEach(series => this.dbManager.deleteSeries(series.path));
        added.forEach(series => this.hardReload(series.path));
    }

    level1change = (parent: Tree, deleted: Tree[], added: Tree[]) => {
        const seriesFolder = parent.path;

        const removeSeason = (folderName: string) => {
            let matched = folderName.match(/\d+/);
            if (!matched) return; // TODO: Weird: Folder with no number (LOG)

            const seasonNumber = this._parseInt(matched[0]);

            if (!seasonNumber) return; // Weird: Folder with no number (LOG)

            this.dbManager.removeSeason(seriesFolder, seasonNumber);
        }; 

        deleted.forEach(node => {
            if (node.name === 'poster.jpeg') {
                // refetch poster (using parent.name)
            } else {
                removeSeason(node.path);
            }
        });

        added.forEach(node => {
            
        });
    }

    level2change = (parent: Tree, deleted: Tree[], added: Tree[]) => {
        
    }

    level3change = (parent: Tree, deleted: Tree[], added: Tree[]) => {
        
    }

    /**
   * Attempts to convert a string `s` into a number. 
   * Returns undefined if not convertible.
  */
    private _parseInt(s: string): number | undefined {
        const result = parseInt(s);

        if (isNaN(result)) {
            return undefined;
        }

        return result;
    }
}

export default ExecuteDifference;