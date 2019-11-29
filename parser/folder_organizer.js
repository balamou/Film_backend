const dirTree = require("directory-tree");
const omdb = require('./omdb');
const SeriesModel = require('../model/series');

const folderOrginizer = async (change, path) => {

    console.log(`${change} happened to ${path}`);
    const pathData = parsePath(path);
    if (!pathData) return;

    if (pathData.type === 'shows') {
        await new Promise(resolve => setTimeout(resolve, 3000)); // wait for 3 seconds
        orginizeSeriesFolder(pathData);
    } else if (pathData.type === 'movies') {
        parseMovie(pathData.name);
    }
};

const orginizeSeriesFolder = pathData => {
    const directoryTree = dirTree(pathData.path);
    if (!directoryTree) return;
    console.log(directoryTree);

    if (directoryTree.type != 'directory') return ;

    // Level order tree traversal
    const move_up = [];
    levelOrderTraversal(directoryTree, (node, level) => {
        if (node.type == 'directory') return;
        if (level >= 3 && isVideoFormat(node.extension))
            move_up.push(node.path);
    });

    const purge = [];
    levelOrderTraversal(directoryTree, (node, level) => {
        if (level == 2 && (node.type == 'directory' || !isVideoFormat(node.extension)))
            purge.push(node.path);
    });

    moveUp(move_up); // Move video files UP
    console.log(purge);
};

const moveUp = async files => {
    for (let i = 0; i < files.length; i++) {
        const components = files[i].split('/');
        const finalPath = `${components[0]}/${components[1]}/${components[2]}/${components[3]}/${components[4]}/`;

        await moveFile(files[i], finalPath);
    }
};

const levelOrderTraversal = (treeNode, onEach) => {
    const queue = [treeNode];
    let level = 0;
    while (queue.length > 0) {
        const size = queue.length;
        console.log(`Level ${level}`);

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