import { FSEditor } from './Adapters/FSEditor';
import { getDirTree, DirTree } from './Adapters/DirTreeCreator';
import Factory from './Factory';
import Tree from './Tree';

const factory = new Factory();
const GLOBAL_EXCLUDE = /.DS_Store|purge|rejected/;
const NETWORK_ENABLED = false;

export default function main() {
    const fsEditor = new FSEditor();
    const path = './public/en/shows';

    if (fsEditor.doesFileExist(`${path}/film.config`)) {
        // Parse file and create a json Tree

    } else {
        orginizeAllSeries(path);
    }
}

function orginizeAllSeries(path: string) {
    const fsEditor = new FSEditor();

    // orginize folder
    const tree = getDirTree(path, GLOBAL_EXCLUDE);

    const folders: Tree[] = [];
    const files: Tree[] = []; // moves files to new folder purge

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

function orginizeSeriesFolder(path: string) {
    const flatten = factory.createFlattenFileTree();
    flatten.flatten(path);

    // Separate
    const directoryTree = getDirTree(path, GLOBAL_EXCLUDE);

    const level4folders: Tree[] = [];
    const level4files: Tree[] = [];

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

    const seriesName = new FSEditor().getBasename(path);

    if (NETWORK_ENABLED) {
        vtParser.getSeriesInformation(seriesName, vtBuilder.virtualTree).then(() => {
            console.log(vtParser.videoInfo);
        });
    }
}

main();