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
const PathValidator_1 = __importDefault(require("./PathValidator"));
// import omdb from './omdb';
// import SeriesModel from '../model/series';
const folderOrginizer = (change, path) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${change} happened to ${path}`);
    if (change != 'addDir')
        return;
    const pathValidator = new PathValidator_1.default();
    const pathData = pathValidator.parsePath(path);
    if (pathData.type === 'shows') {
        const fs = require('fs');
        fs.unlinkSync(`${pathData.fullPath}/.DS_Store`);
        yield new Promise(resolve => setTimeout(resolve, 3000)); // wait for 3 seconds
        // await orginizeSeriesFolder(pathData);
    }
    else if (pathData.type === 'movies') {
    }
});
exports.default = folderOrginizer;
// const orginizeSeriesFolder = async pathData => {
//     const result = parseTreeFolder(pathData);
//     console.log(result.moveup);
//     console.log(result.purge);
//     if (!result) return;
//     await moveUp(result.moveup);
//     makeDirectory(`${pathData.path}/purge`); // create file purge
//     for (let i = 0; i < result.purge.length; i++) {
//         await moveFile(result.purge[i], `${pathData.path}/purge`);
//     }
//     // Separate 
//     const directoryTree = dirTree(pathData.path, { exclude: /.DS_Store|purge/ });
//     if (!directoryTree) return;
//     const level4folders = [];
//     const level4files = [];
//     levelOrderTraversal(directoryTree, (node, level) => {
//         if (level == 1 && node.type == 'directory')
//             level4folders.push(node);
//         if (level == 1 && node.type == 'file')
//             level4files.push(node);
//     });
//     console.log(level4folders);
//     console.log(level4files);
// //  return;
//     // Create virtual tree
//     const virtualTree = [];
//     const rejected = [];
//     for (let i = 0; i < level4files.length; i++) {
//         const ptt = require("parse-torrent-title");
//         const information = ptt.parse(level4files[i].name);
//         if (information.season && information.episode) {
//             const currSeason = information.season;
//             const currEpisode = information.episode;
//             let season = virtualTree.find(item => item.season == currSeason);
//             if (!season) { 
//                 season = { season: currSeason, episodes: []};
//                 virtualTree.push(season);
//             }
//             let episode = season.episodes.find(item => item.episode == currEpisode);
//             if (episode) { // episode already exists => move to rejected
//                 makeDirectory(`${pathData.path}/rejected`);
//                 moveFile(level4files[i].path, `${pathData.path}/rejected`);
//             } else {
//                 season.episodes.push({ episode: currEpisode, file: level4files[i] });
//             }
//         } else {
//             // move to `rejected`
//             makeDirectory(`${pathData.path}/rejected`);
//             moveFile(level4files[i].path, `${pathData.path}/rejected`);
//         }
//     }
//     // Folders 
//     for (let i = 0; i < level4folders.length; i++) {
//         // Parse out season number from folder name
//         const folder = level4folders[i];
//         const allNubmers = folder.name.replace(/\D+/g, '');
//         const seasonNumber = parseInt(allNubmers);
//         if (!folder.children) continue;
//         let season = virtualTree.find(item => item.season == seasonNumber);
//         if (!season) {
//             season = { season: seasonNumber, episodes: [] };
//             virtualTree.push(season);
//         }
//         folder.children.forEach( item => {
//             if (item.type != 'file') return;
//             const ptt = require("parse-torrent-title");
//             const information = ptt.parse(item.name);
//             let epNum = information.episode;
//             if (!epNum) {
//                 const match = item.name.match(/\d+/);
//                 if (!match) {
//                     rejected.push(item.path); // move ep to reject
//                     return;
//                 }
//                 epNum = parseInt(match[0]);
//             }
//             season.episodes.push({episode: epNum, file: item});
//         });
//     }
//     console.log(virtualTree);
//     commit(virtualTree, pathData);
// };
// const commit = (virtualTree, pathData) => {
//     virtualTree.forEach( season => {
//         const newFolder = `S${season.season}`;
//         makeDirectory(`${pathData.path}/${newFolder}`);
//         season.episodes.forEach( ep => {
//             moveAndRename(ep.file.path, `${pathData.path}/${newFolder}/E${ep.episode}${ep.file.extension}`);
//         });
//     });
// };
// const parseTreeFolder = pathData => {
//     const directoryTree = dirTree(pathData.path, { exclude: /.DS_Store/ });
//     if (!directoryTree) return;
//     // console.log(directoryTree);
//     if (directoryTree.type != 'directory') return null;
//     const move_up = [];
//     let purge = [];
//     const level4folders = [];
//     levelOrderTraversal(directoryTree, (node, level) => {
//         if (level >= 3 && node.type == 'file' && isVideoFormat(node.extension))
//             move_up.push(node.path);
//         if (level == 1 && node.type == 'directory')
//             level4folders.push(node);
//         if (level == 2 && (node.type == 'directory' || !isVideoFormat(node.extension)))
//             purge.push(node.path);
//         if (level == 1 && node.type == 'file' && !isVideoFormat(node.extension))
//             purge.push(node.path);
//     });
//     const filtered = level4folders.filter(folder => {
//         const doesFolderHaveAVideo = treeContains(folder, node => node.type == 'file' && isVideoFormat(node.extension));
//         return !doesFolderHaveAVideo;
//     });
//     const filteredPaths = filtered.map(node => node.path);
//     purge = purge.concat(filteredPaths);
//     return {
//         moveup: move_up,
//         purge: purge
//     };
// };
// const moveUp = async files => {
//     for (let i = 0; i < files.length; i++) {
//         const components = files[i].split('/');
//         const finalPath = `${components[0]}/${components[1]}/${components[2]}/${components[3]}/${components[4]}/`;
//         await moveFile(files[i], finalPath);
//     }
// };
// const makeDirectory = dir => {
//     var fs = require('fs');
//     if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir);
//     }
// }
// const levelOrderTraversal = (treeNode, onEach) => {
//     const queue = [treeNode];
//     let level = 0;
//     while (queue.length > 0) {
//         const size = queue.length;
//         // console.log(`Level ${level}`);
//         for (let i = 0; i < size; i++) {
//             const currNode = queue.shift();
//             const children = currNode.children;
//             onEach(currNode, level);
//             if (!children) continue;
//             children.forEach(item => queue.push(item));
//         }
//         level++;
//     }
// };
// const treeContains = (node: any, predicate: any) => { // BFS
//     const queue = [node];
//     while(queue.length > 0) {
//         const currNode = queue.shift();
//         const children = currNode.children;
//         if (predicate(currNode)) return true;
//         if (!children) continue;
//         children.forEach((item: any) => queue.push(item));
//     }
// };
// const isVideoFormat = (extension: string) => {
//     const supportedExtensions = ['.ASX', '.DTS', '.GXF', '.M2V', '.M3U', '.M4V', '.MPEG1', '.MPEG2', '.MTS', '.MXF', '.OGM', '.PLS', '.BUP', '.A52', '.AAC', '.B4S', '.CUE', '.DIVX', '.DV', '.FLV', '.M1V', '.M2TS', '.MKV', '.MOV', '.MPEG4', '.OMA', '.SPX', '.TS', '.VLC', '.VOB', '.XSPF', '.DAT', '.BIN', '.IFO', '.PART', '.3G2', '.AVI', '.MPEG', '.MPG', '.FLAC', '.M4A', '.MP1', '.OGG', '.WAV', '.XM', '.3GP', '.SRT', '.WMV', '.AC3', '.ASF', '.MOD', '.MP2', '.MP3', '.MP4', '.WMA', '.MKA', '.M4P'];
//     return supportedExtensions.includes(extension.toUpperCase());
// }
// const moveFile = (file: string, dir2: string) => {
//     const fs = require('fs');
//     const path = require('path');
//     //gets file name and adds it to dir2
//     const basename = path.basename(file);
//     const dest = path.resolve(dir2, basename);
//     return new Promise((resolve, reject) => {
//         fs.rename(file, dest, (err: Error) => {
//             if (err) reject(err);
//             else resolve(dest);
//         });
//     });
// };
// const moveAndRename = (file: string, fileNewName: string) => {
//     return new Promise((resolve, reject) => {
//         const fs = require('fs');
//         fs.rename(file, fileNewName, (err: Error) => {
//             if (err) reject(err);
//             else resolve(fileNewName);
//         });
//     });
// };
// const parseMovie = (movieName: string) => {
//     console.log('parse movie');
// };
// const parsePath = (path: string) => {
//     const pathComponents = path.split('/'); // example: [ 'public', 'en', 'shows', 'rick_and_morty' ]
//     console.log(pathComponents);
//     const language = pathComponents[1];
//     const type = pathComponents[2];
//     if (pathComponents.length < 4) { console.log('Not the right directory'); return false; }
//     if (!(language === 'en' || language === 'ru')) { console.log('No language directory found'); return false; }
//     if (!(type === 'shows' || type === 'movies')) { console.log('Has to be in a `shows` or `movies` directory'); return false; }
//     return {
//         path: path,
//         rootDirectory: pathComponents[0],
//         language: pathComponents[1],
//         type: pathComponents[2],
//         name: pathComponents[3],
//         root: () => {
//             return `${pathComponents[0]}/${pathComponents[1]}/${pathComponents[2]}`;
//         }
//     };
// };
// export default folderOrginizer;
