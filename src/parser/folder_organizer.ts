import { PathValidator, PathData } from './PathValidator';
import { FlattenFileTree } from './FlattenFileTree';

// import omdb from './omdb';
// import SeriesModel from '../model/series';

const folderOrginizer = async (change: string, path: string) => {
    console.log(`${change} happened to ${path}`);
    if (change != 'addDir') return;

    const pathValidator = new PathValidator();
    const pathData = pathValidator.parsePath(path);

    if (pathData.type === 'shows') {
        await new Promise(resolve => setTimeout(resolve, 3000)); // wait for 3 seconds
        removeDStoreFrom(pathData.fullPath);
        await orginizeSeriesFolder(pathData);
    } else if (pathData.type === 'movies') {
    }
};

function removeDStoreFrom(path: string) {
    const fs = require('fs');
    fs.unlinkSync(`${path}/.DS_Store`);
}


const orginizeSeriesFolder = async (pathData: PathData) => {
    const result = parseTreeFolder(pathData);
    console.log(result.moveup);
    console.log(result.purge);
    if (!result) return;

    await moveUp(result.moveup);
    makeDirectory(`${pathData.path}/purge`); // create file purge

    for (let i = 0; i < result.purge.length; i++) {
        await moveFile(result.purge[i], `${pathData.path}/purge`);
    }

    // Separate 
    const directoryTree = dirTree(pathData.path, { exclude: /.DS_Store|purge/ });
    if (!directoryTree) return;

    const level4folders = [];
    const level4files = [];

    levelOrderTraversal(directoryTree, (node, level) => {
        if (level == 1 && node.type == 'directory')
            level4folders.push(node);
        
        if (level == 1 && node.type == 'file')
            level4files.push(node);
    });

    console.log(level4folders);
    console.log(level4files);
//  return;
    // Create virtual tree
    const virtualTree = [];
    const rejected = [];
    for (let i = 0; i < level4files.length; i++) {
        const ptt = require("parse-torrent-title");
        const information = ptt.parse(level4files[i].name);

        if (information.season && information.episode) {
            const currSeason = information.season;
            const currEpisode = information.episode;

            let season = virtualTree.find(item => item.season == currSeason);
            if (!season) { 
                season = { season: currSeason, episodes: []};
                virtualTree.push(season);
            }

            let episode = season.episodes.find(item => item.episode == currEpisode);
            if (episode) { // episode already exists => move to rejected
                makeDirectory(`${pathData.path}/rejected`);
                moveFile(level4files[i].path, `${pathData.path}/rejected`);
            } else {
                season.episodes.push({ episode: currEpisode, file: level4files[i] });
            }
        } else {
            // move to `rejected`
            makeDirectory(`${pathData.path}/rejected`);
            moveFile(level4files[i].path, `${pathData.path}/rejected`);
        }
    }

    // Folders 
    for (let i = 0; i < level4folders.length; i++) {
        // Parse out season number from folder name
        const folder = level4folders[i];
        const allNubmers = folder.name.replace(/\D+/g, '');
        const seasonNumber = parseInt(allNubmers);
        
        if (!folder.children) continue;

        let season = virtualTree.find(item => item.season == seasonNumber);
        if (!season) {
            season = { season: seasonNumber, episodes: [] };
            virtualTree.push(season);
        }

        folder.children.forEach( item => {
            if (item.type != 'file') return;
            const ptt = require("parse-torrent-title");
            const information = ptt.parse(item.name);
            let epNum = information.episode;
            
            if (!epNum) {
                const match = item.name.match(/\d+/);
                if (!match) {
                    rejected.push(item.path); // move ep to reject
                    return;
                }
                epNum = parseInt(match[0]);
            }

            season.episodes.push({episode: epNum, file: item});
        });
    }
    console.log(virtualTree);
    commit(virtualTree, pathData);
};

// const commit = (virtualTree, pathData) => {
//     virtualTree.forEach( season => {
//         const newFolder = `S${season.season}`;
//         makeDirectory(`${pathData.path}/${newFolder}`);

//         season.episodes.forEach( ep => {
//             moveAndRename(ep.file.path, `${pathData.path}/${newFolder}/E${ep.episode}${ep.file.extension}`);
//         });
//     });
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

export default folderOrginizer;