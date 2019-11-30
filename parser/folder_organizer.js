const dirTree = require("directory-tree");
const omdb = require('./omdb');
const SeriesModel = require('../model/series');

const folderOrginizer = async (change, path) => {

    console.log(`${change} happened to ${path}`);
    if (change != 'addDir') return;

    const pathData = parsePath(path);
    if (!pathData) return;

    if (pathData.type === 'shows') {
        await new Promise(resolve => setTimeout(resolve, 3000)); // wait for 3 seconds
        await orginizeSeriesFolder(pathData);
    } else if (pathData.type === 'movies') {
        parseMovie(pathData.name);
    }
};

const orginizeSeriesFolder = async pathData => {
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
 
    // Create virtual tree
    const virtualTree = [];
    for (let i = 0; i < level4files.length; i++) {
        const ptt = require("parse-torrent-title");
        const information = ptt.parse(level4files[i].name);

        console.log(information);

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
                season.episodes.push({ episode: currEpisode, path: level4files[i].path });
            }
        } else {
            // move to `rejected`
            makeDirectory(`${pathData.path}/rejected`);
            moveFile(level4files[i].path, `${pathData.path}/rejected`);
        }
    }
    console.log(virtualTree);
};

const parseTreeFolder = pathData => {
    const directoryTree = dirTree(pathData.path, { exclude: /.DS_Store/ });
    if (!directoryTree) return;
    // console.log(directoryTree);

    if (directoryTree.type != 'directory') return null;

    const move_up = [];
    let purge = [];
    const level4folders = [];

    levelOrderTraversal(directoryTree, (node, level) => {
        if (level >= 3 && node.type == 'file' && isVideoFormat(node.extension))
            move_up.push(node.path);

        if (level == 1 && node.type == 'directory')
            level4folders.push(node);

        if (level == 2 && (node.type == 'directory' || !isVideoFormat(node.extension)))
            purge.push(node.path);

        if (level == 1 && node.type == 'file' && !isVideoFormat(node.extension))
            purge.push(node.path);
    });

    const filtered = level4folders.filter(folder => {
        const doesFolderHaveAVideo = treeContains(folder, node => node.type == 'file' && isVideoFormat(node.extension));

        return !doesFolderHaveAVideo;
    });

    const filteredPaths = filtered.map(node => node.path);

    purge = purge.concat(filteredPaths);

    return {
        moveup: move_up,
        purge: purge
    };
};

const moveUp = async files => {
    for (let i = 0; i < files.length; i++) {
        const components = files[i].split('/');
        const finalPath = `${components[0]}/${components[1]}/${components[2]}/${components[3]}/${components[4]}/`;

        await moveFile(files[i], finalPath);
    }
};

const makeDirectory = dir => {
    var fs = require('fs');

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

const levelOrderTraversal = (treeNode, onEach) => {
    const queue = [treeNode];
    let level = 0;
    while (queue.length > 0) {
        const size = queue.length;
        // console.log(`Level ${level}`);

        for (let i = 0; i < size; i++) {
            const currNode = queue.shift();
            const children = currNode.children;

            onEach(currNode, level);

            if (!children) continue;

            children.forEach(item => queue.push(item));
        }

        level++;
    }
};

const treeContains = (node, predicate) => { // BFS
    const queue = [node];

    while(queue.length > 0) {
        const currNode = queue.shift();
        const children = currNode.children;

        if (predicate(currNode)) return true;
        if (!children) continue;

        children.forEach(item => queue.push(item));
    }
};

const isVideoFormat = extension => {
    const supportedExtensions = ['.ASX', '.DTS', '.GXF', '.M2V', '.M3U', '.M4V', '.MPEG1', '.MPEG2', '.MTS', '.MXF', '.OGM', '.PLS', '.BUP', '.A52', '.AAC', '.B4S', '.CUE', '.DIVX', '.DV', '.FLV', '.M1V', '.M2TS', '.MKV', '.MOV', '.MPEG4', '.OMA', '.SPX', '.TS', '.VLC', '.VOB', '.XSPF', '.DAT', '.BIN', '.IFO', '.PART', '.3G2', '.AVI', '.MPEG', '.MPG', '.FLAC', '.M4A', '.MP1', '.OGG', '.WAV', '.XM', '.3GP', '.SRT', '.WMV', '.AC3', '.ASF', '.MOD', '.MP3', '.MP4', '.WMA', '.MKA', '.M4P'];
    return supportedExtensions.includes(extension.toUpperCase());
}

const moveFile = (file, dir2) => {
    const fs = require('fs');
    const path = require('path');

    //gets file name and adds it to dir2
    const basename = path.basename(file);
    const dest = path.resolve(dir2, basename);

    return new Promise((resolve, reject) => {
        fs.rename(file, dest, (err) => {
            if (err) reject(err);
            else resolve(dest);
        });
    });
};

const parseMovie = movieName => {
    console.log('parse movie');
};

const parsePath = path => {
    const pathComponents = path.split('/'); // example: [ 'public', 'en', 'shows', 'rick_and_morty' ]
    console.log(pathComponents);

    const language = pathComponents[1];
    const type = pathComponents[2];

    if (pathComponents.length < 4) { console.log('Not the right directory'); return false; }
    if (!(language === 'en' || language === 'ru')) { console.log('No language directory found'); return false; }
    if (!(type === 'shows' || type === 'movies')) { console.log('Has to be in a `shows` or `movies` directory'); return false; }

    return {
        path: path,
        rootDirectory: pathComponents[0],
        language: pathComponents[1],
        type: pathComponents[2],
        name: pathComponents[3],
        root: () => {
            return `${pathComponents[0]}/${pathComponents[1]}/${pathComponents[2]}`;
        }
    };
};

module.exports = folderOrginizer;