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
Object.defineProperty(exports, "__esModule", { value: true });
const PathValidator_1 = require("./PathValidator");
const DirTreeCreator_1 = require("../Adapters/DirTreeCreator");
// import omdb from './omdb';
// import SeriesModel from '../model/series';
const folderOrginizer = (change, path) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${change} happened to ${path}`);
    if (change != 'addDir')
        return;
    const pathData = new PathValidator_1.PathValidator().parsePath(path);
    if (pathData.type === 'shows') {
        yield new Promise(resolve => setTimeout(resolve, 3000)); // wait for 3 seconds
        //removeDStoreFrom(pathData.fullPath);
        yield orginizeSeriesFolder(pathData);
    }
    else if (pathData.type === 'movies') {
    }
});
function removeDStoreFrom(path) {
    const fs = require('fs');
    fs.unlinkSync(`${path}/.DS_Store`);
}
const orginizeSeriesFolder = (pathData) => __awaiter(void 0, void 0, void 0, function* () {
    const directoryTree = new DirTreeCreator_1.DirTree().treeFrom(pathData.fullPath, /.DS_Store|purge/);
    if (!directoryTree)
        return;
    console.log(directoryTree);
    console.log(directoryTree.hash());
    //const flatten = new FlattenFileTree(new DirTree(), new FSEditor());
    //flatten.flatten(pathData.fullPath);
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
});
exports.default = folderOrginizer;
