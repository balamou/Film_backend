"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FSEditor_1 = require("./Adapters/FSEditor");
const DirTreeCreator_1 = require("./Adapters/DirTreeCreator");
const Factory_1 = __importDefault(require("./Factory"));
const factory = new Factory_1.default();
const GLOBAL_EXCLUDE = /.DS_Store|purge|rejected/;
const NETWORK_ENABLED = false;
function main() {
    const fsEditor = new FSEditor_1.FSEditor();
    const path = './public/en/shows';
    if (fsEditor.doesFileExist(`${path}/film.config`)) {
        // Parse file and create a json Tree
    }
    else {
        orginizeAllSeries(path);
    }
}
exports.default = main;
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
    const seriesName = new FSEditor_1.FSEditor().getBasename(path);
    if (NETWORK_ENABLED) {
        vtParser.getSeriesInformation(seriesName, vtBuilder.virtualTree).then(() => {
            console.log(vtParser.videoInfo);
        });
    }
}
main();
