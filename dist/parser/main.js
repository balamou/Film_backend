"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FSEditor_1 = require("./Adapters/FSEditor");
const DirTreeCreator_1 = require("./Adapters/DirTreeCreator");
const Factory_1 = __importDefault(require("./Factory"));
const factory = new Factory_1.default();
function main() {
    const fs = new FSEditor_1.FSEditor();
    const path = './public/en/shows';
    if (fs.doesFileExist(`${path}/film.config`)) {
        // Parse file and create a json Tree
    }
    else {
        // orginize folder
        const tree = DirTreeCreator_1.getDirTree(path, /.DS_Store/);
        console.log(tree);
        const folders = new Array(); // 
        const files = new Array(); // moves files to new folder purge
        tree.levelOrderTraversal((node, level) => {
            if (level == 1 && node.isFolder)
                folders.push(node);
            if (level == 1 && node.isFile)
                files.push(node);
        });
        folders.forEach(folder => orginizeSeriesFolder(folder.path));
    }
}
exports.default = main;
function orginizeSeriesFolder(path) {
    const flatten = factory.createFlattenFileTree();
    flatten.flatten(path);
    // // Separate 
    // const directoryTree = new DirTree().treeFrom(pathData.fullPath, /.DS_Store|purge/);
    // if (!directoryTree) return;
    // const level4folders: Tree[] = [];
    // const level4files: Tree[] = [];
    // directoryTree.levelOrderTraversal((node, level) => {
    //     if (level == 1 && node.isFolder)
    //         level4folders.push(node);
    //     if (level == 1 && node.isFile)
    //         level4files.push(node);
    // });
    // console.log(level4folders);
    // console.log(level4files);
    // const vtBuilder = new VirtualTreeBuilder(pathData.fullPath, new TitleParserAdapter(), new FSEditor());
    // vtBuilder.buildVirtualTree(level4files);
    // vtBuilder.buildVirtualTree(level4folders);
    // console.log(vtBuilder.virtualTree);
    // vtBuilder.commit();
}
main();
