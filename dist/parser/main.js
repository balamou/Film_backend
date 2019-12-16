"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FSEditor_1 = require("./Adapters/FSEditor");
const DirTreeCreator_1 = require("./Adapters/DirTreeCreator");
const Factory_1 = __importDefault(require("./Factory"));
const Tree_1 = __importDefault(require("./Tree"));
const factory = new Factory_1.default();
const GLOBAL_EXCLUDE = /.DS_Store|purge|rejected|film.config/;
const NETWORK_ENABLED = true;
const DATABASE_ENABLED = true;
function main() {
    const fsEditor = new FSEditor_1.FSEditor();
    const path = './public/en/shows';
    if (fsEditor.doesFileExist(`${path}/film.config`)) {
        const tree = loadDirectoryStateFromFile(path);
        const currTree = DirTreeCreator_1.getDirTree(path, GLOBAL_EXCLUDE);
        if (tree) {
            console.log(tree);
            console.log(currTree);
            if (tree.hash() === currTree.hash()) {
                console.log("No changes in the file system.");
            }
            else {
                console.log("Changes occured!");
            }
        }
    }
    else {
        orginizeAllSeries(path);
        saveDirectoryStateOnDisk(path);
    }
}
exports.default = main;
function saveDirectoryStateOnDisk(path) {
    const tree = DirTreeCreator_1.getDirTree(path, GLOBAL_EXCLUDE);
    const fsEditor = new FSEditor_1.FSEditor();
    fsEditor.writeToFile(`${path}/film.config`, JSON.stringify(tree));
}
function loadDirectoryStateFromFile(path) {
    const fsEditor = new FSEditor_1.FSEditor();
    try {
        const data = fsEditor.readFile(`${path}/film.config`);
        const tree = JSON.parse(data);
        return Tree_1.default.instanciateFromJSON(tree);
    }
    catch (_a) {
        console.log("Error loading or decoding 'film.config' file");
        return undefined;
    }
}
function orginizeAllSeries(path) {
    const fsEditor = new FSEditor_1.FSEditor();
    // orginize folder
    const tree = DirTreeCreator_1.getDirTree(path, GLOBAL_EXCLUDE);
    const folders = [];
    const files = []; // moves files to new folder purge
    tree.levelOrderTraversal((node, level) => {
        if (level == 1 && node.isFolder)
            folders.push(node);
        if (level == 1 && node.isFile)
            files.push(node);
    });
    // move files to purge
    const purgeFolder = `${path}/purge`;
    fsEditor.makeDirectory(purgeFolder);
    files.forEach(file => fsEditor.moveFileToFolder(file.path, purgeFolder));
    folders.forEach(folder => orginizeSeriesFolder(folder.path));
}
function orginizeSeriesFolder(path) {
    const flatten = factory.createFlattenFileTree();
    flatten.flatten(path);
    // Separate
    const directoryTree = DirTreeCreator_1.getDirTree(path, GLOBAL_EXCLUDE);
    const level4folders = [];
    const level4files = [];
    directoryTree.levelOrderTraversal((node, level) => {
        if (level == 1 && node.isFolder)
            level4folders.push(node);
        if (level == 1 && node.isFile)
            level4files.push(node);
    });
    // Virtual tree
    const vtBuilder = factory.createVirtualTreeBuilder();
    vtBuilder.buildVirtualTree(level4files);
    vtBuilder.buildVirtualTreeFromFolders(level4folders);
    vtBuilder.commit(path);
    // Parse Virtual tree
    const vtParser = factory.createVirtualTreeParser();
    vtParser.generateThumbnails(vtBuilder.virtualTree);
    const seriesName = new FSEditor_1.FSEditor().getBasename(path); // get series name from file
    if (NETWORK_ENABLED) {
        const seriesInfo = vtParser.getSeriesInformation(path, seriesName, vtBuilder.virtualTree);
        console.log(seriesInfo);
        // Add data to database
        if (DATABASE_ENABLED) {
            commitToDB(path, seriesName, seriesInfo);
        }
    }
}
const episode_1 = __importDefault(require("../model/episode"));
const series_1 = __importDefault(require("../model/series"));
function commitToDB(path, seriesName, seriesInfo) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        // nil coalescing and optional chaining will be marked as an error
        // but it can be safely ignored
        yield series_1.default.create({
            language: 'en',
            folder: path,
            title: (_b = (_a = seriesInfo.seriesInfo) === null || _a === void 0 ? void 0 : _a.title, (_b !== null && _b !== void 0 ? _b : seriesName)),
            seasons: (_c = seriesInfo.seriesInfo) === null || _c === void 0 ? void 0 : _c.totalSeasons,
            desc: (_d = seriesInfo.seriesInfo) === null || _d === void 0 ? void 0 : _d.plot,
            poster: (_e = seriesInfo.seriesInfo) === null || _e === void 0 ? void 0 : _e.poster
        });
        for (const videoInfo of seriesInfo.videoInfo) {
            yield episode_1.default.create({
                episodeNumber: videoInfo.episode,
                seasonNumber: videoInfo.season,
                videoURL: videoInfo.videoPath,
                duration: (_f = videoInfo.duration, (_f !== null && _f !== void 0 ? _f : 10)),
                thumbnailURL: videoInfo.thumbnail,
                title: videoInfo.title,
                plot: videoInfo.plot
            }, { logging: false });
        }
    });
}
main();
