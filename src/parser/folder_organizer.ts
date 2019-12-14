import { PathValidator, PathData } from './PathValidator';
import { FlattenFileTree} from './FlattenFileTree';
import { FSEditor } from './Adapters/FSEditor';
import { DirTree } from './Adapters/DirTreeCreator';
import Tree from './Tree';
import { VirtualTreeBuilder } from './VirtualTree/VirtualTreeBuilder';
import { TitleParser, TitleParserAdapter } from './Adapters/TitleParser';

// import omdb from './omdb';
// import SeriesModel from '../model/series';

const folderOrginizer = async (change: string, path: string) => {
    console.log(`${change} happened to ${path}`);
    if (change != 'addDir') return;

    const pathData = new PathValidator().parsePath(path);

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
    const flatten = new FlattenFileTree(new DirTree(), new FSEditor());
    flatten.flatten(pathData.fullPath);
    
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
};

export default folderOrginizer;