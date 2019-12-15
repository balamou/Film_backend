"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FSEditor_1 = require("./Adapters/FSEditor");
const DirTreeCreator_1 = require("./Adapters/DirTreeCreator");
const Factory_1 = __importDefault(require("./Factory"));
const VirtualTreeParser_1 = __importDefault(require("./VirtualTree/VirtualTreeParser"));
const factory = new Factory_1.default();
const GLOBAL_EXCLUDE = /.DS_Store|purge|rejected/;
function main() {
    const fs = new FSEditor_1.FSEditor();
    const path = './public/en/shows';
    if (fs.doesFileExist(`${path}/film.config`)) {
        // Parse file and create a json Tree
    }
    else {
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
        const fsEditor = new FSEditor_1.FSEditor();
        const purgeFolder = `${path}/purge`;
        fsEditor.makeDirectory(purgeFolder);
        files.forEach(file => fsEditor.moveFileToFolder(file.path, purgeFolder));
        folders.forEach(folder => orginizeSeriesFolder(folder.path));
    }
}
exports.default = main;
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
    removeDSStore(path);
    // Parse Virtual tree
    const vtParser = new VirtualTreeParser_1.default();
    vtParser.generateThumbnails(vtBuilder.virtualTree);
}
function removeDSStore(path) {
    const fsEditor = new FSEditor_1.FSEditor();
    const ds_store = `${path}/.DS_Store`;
    if (fsEditor.doesFileExist(ds_store))
        fsEditor.deleteFile(ds_store);
}
main();
