import DatabaseManager from "../../database/DatabaseManager";
import { TitleParserAdapter } from "../Adapters/TitleParser";

import Orginizer from "./Orginizer";
import Factory from "./Factory";
import Tree from "../Tree/Tree";
import { Difference } from '../Tree/TreeDifference';

import Path from 'path';

class DifferenceOrginizer extends Orginizer {
    private readonly dbManager: DatabaseManager;
    private readonly titleParser: TitleParserAdapter;
    
    constructor(language: string, factory: Factory, exclude: RegExp) {
        super(language, factory, exclude);

        this.dbManager = new DatabaseManager(); // TODO?: Dependency injection
        this.titleParser = new TitleParserAdapter(); // TODO: move to factory
    }

    // Instructions

    // d[SERIES] remove from DB
    // a[SERIES] do a hard reload (Assumption -> all files are purged before this method executes)

    //      d[SEASON, POSTER] if poster deleted => refetch. If season deleted => remove from DB
    //      *a[FOLDER(season/purge), FILE(video/purge)] if folder added => parse season, extract thumbs & add to db. if file added => check if file video then accumulate them into a season/seasons, else purge

    //          d[EPISODE, THUMBNAILS]: if video file => remove Episode from database, if thumbnails folder then regenerate thumbnails for each episode
    //          a[FOLDER(purge), FILE(video, purge)]: if video added => parse Episode information from title, scrape thumbs, parse from imdb, else purge

    //              d[THUMBNAIL]: regenerate thumbnail if possible
    //              Added: purge all added
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
                    // this.level2change(seriesFolder, parent, deleted, added); // TODO: Get series folder
                break;
                case 3:
                    // this.level3change(seriesFolder, parent, deleted, added); // TODO: Get series folder
                break;
            }
        });
        
        this.dbManager.endConnection(); // async 
    }

    private levelOchange = (parent: Tree, deleted: Tree[], added: Tree[]) => {
        deleted.forEach(series => this.dbManager.deleteSeries(series.path));
        added.forEach(series => this.orginizeSeriesFolder(series.path));
    }

    private level1change = (parent: Tree, deleted: Tree[], added: Tree[]) => {
        const seriesFolder = parent.path;

        deleted.forEach(node => {
            if (node.name === 'poster.jpeg') {
                this.refetchSeriesPoster(seriesFolder);
            } else {
                this.removeSeason(seriesFolder, node.path);
            }
        });

        this.handleAddedLevel1(seriesFolder, added);
    }

    /**
     * @param seriesFolder path to the series folder
     * @param folderName name of the deleted folder in `seriesFolder` directory
    */
    private removeSeason(seriesFolder: string, folderName: string) {
        const seasonNumber = this.titleParser.parseSeasonFrom(folderName);

        if (seasonNumber) {
            console.log(`Removing season ${seasonNumber}`);
            this.dbManager.removeSeason(seriesFolder, seasonNumber);
        }
    }; 

    private refetchSeriesPoster(seriesFolder: string) {
        // TODO: refetch poster (using `seriesFolder`)
    }

    /**
     * @param path to the series folder
     * @param added files/folders added to the series folder
    */
    private handleAddedLevel1(path: string, added: Tree[]) {
        const log = console.log;
        const seriesName = Path.parse(path).name;

        const videos = added.filter(node => node.isFile && node.isVideo);
        const folders = added.filter(node => node.isFolder);
        const purge = added.filter(node => node.isFile && !node.isVideo);
        this.purge(path, purge);

        if (videos.length === 0 && folders.length === 0) return; // do nothing

        const vtBuilder = this.factory.createVirtualTreeBuilder();

        vtBuilder.buildVirtualTreeFromFiles(videos);
        vtBuilder.buildVirtualTreeFromFolders(folders);

        vtBuilder.commit(path);
        //----------
        const vtParser = this.factory.createVirtualTreeParser(this.language);
        const dbManager = this.factory.createDatabaseManager(this.language);
        
        const virtualTree = vtBuilder.virtualTree;

        vtParser.generateThumbnails(virtualTree);
        
        if (this.NETWORK_ENABLED) {
            log(`Fetching ${seriesName} information`);
            const seriesData = vtParser.getSeriesInformation(path, seriesName, virtualTree);
            
            if (this.DATABASE_ENABLED) {
                log(`Adding ${seriesName} to the database`);
                const newEpisodes = seriesData.episodesInfo.map(x => `S${x.season}E${x.episode}`);
                log(`New episodes ->`, newEpisodes);
                try {
                    dbManager.commitNewEpisodesToExistingShow(path, seriesData); 
                } catch (error) {
                    log(error);
                }
                log(`Done adding to the database`);
            }
        }
    }

    private purge(path: string, files: Tree[]) {
        const purger = this.factory.createFilePurger();
        purger.insertPaths(files.map(x => x.path));
        purger.purge(`${path}/purge`);
    }

    private level2change = (seriesFolder: string, parent: Tree, deleted: Tree[], added: Tree[]) => {
        deleted.forEach(node => {
            if (node.name === 'thumbnails') {
                // TODO: Regenerate thumbnails
            }

            if (node.isVideo) {
                // TODO: Delete episode from DB
            }
        });

        this.handleAddedLevel2(seriesFolder, added);
    }

    private handleAddedLevel2(pathToSeries: string, added: Tree[]) {
        const videos = added.filter(node => node.isFile && node.isVideo);
        const purge = added.filter(node => node.isFolder || (node.isFile && !node.isVideo));
        this.purge(pathToSeries, purge);

        if (videos.length === 0) return;
        // TODO: Add new episodes to DB & get thumbnails
    }

    private level3change = (seriesFolder: string, parent: Tree, deleted: Tree[], added: Tree[]) => {
        this.purge(seriesFolder, added);

        deleted.forEach(node => {
            if (node.extension === '.png') {
                // TODO: regenerate episode thumbnail
            }
        });
    }

}

export default DifferenceOrginizer;