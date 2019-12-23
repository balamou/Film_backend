import { FSEditor } from './Adapters/FSEditor';
import { getDirTree } from './Adapters/DirTreeCreator';
import Factory from './Factory';
import Tree from './Tree/Tree';
import DatabaseManager from './DatabaseManager/DatabaseManager';
import diffTrees from './Tree/DiffTrees';
import ExecuteDifference from './ExecuteDifference';

const factory = new Factory();
const GLOBAL_EXCLUDE = /.DS_Store|purge|rejected|film.config/;
const NETWORK_ENABLED = true;
const DATABASE_ENABLED = true;

export default function main() { // TODO: Rename to facade
    const fsEditor = new FSEditor();
    const path = './public/en/shows';

    if (fsEditor.doesFileExist(`${path}/film.config`)) {
        dirTreeComparison(path);
    } else {
        orginizeAllSeries(path);
        saveDirectoryStateOnDisk(path);
    }
}

function dirTreeComparison(path: string) {
    removeFiles(path); // remove files from path
    const tree = loadDirectoryStateFromFile(path);
    const currTree = getDirTree(path, GLOBAL_EXCLUDE);

    if (tree) {
        // console.log(tree);
        // console.log(currTree);

        if (tree.hash() === currTree.hash()) {
            console.log("No changes in the file system.");
        } else {
            console.log("Changes occured!");
            const difference = diffTrees(tree, currTree);
            difference.print();
            const execDiff = new ExecuteDifference(new FSEditor(), orginizeSeriesFolder); // TODO: move to the factory
            execDiff.execute(difference);
            // TODO: resave dir state
        }
    }
}

function removeFiles(path: string) {
    const tree = getDirTree(path, GLOBAL_EXCLUDE);
    const purge = tree.children.filter(child => child.isFile);
    purgeFiles(path, purge);
}

function saveDirectoryStateOnDisk(path: string) {
    const tree = getDirTree(path, GLOBAL_EXCLUDE);
    const fsEditor = new FSEditor();

    fsEditor.writeToFile(`${path}/film.config`, JSON.stringify(tree));
}

function loadDirectoryStateFromFile(path: string): Tree | undefined {
    const fsEditor = new FSEditor();

    try {
        const data = fsEditor.readFile(`${path}/film.config`);
        const tree = JSON.parse(data) as Tree;

        return Tree.instanciateFromJSON(tree);
    } catch {
        console.log("Error loading or decoding 'film.config' file");
        return undefined;
    }
}

function purgeFiles(path: string, files: Tree[]) {
    const fsEditor = new FSEditor();
    const purgeFolder = `${path}/purge`;
    fsEditor.makeDirectory(purgeFolder);
    files.forEach(file => fsEditor.moveFileToFolder(file.path, purgeFolder));
}

function orginizeAllSeries(path: string) {
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
    purgeFiles(path, files);

    // orginize each series folder
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

    const seriesName = new FSEditor().getBasename(path); // get series name from file

    if (!NETWORK_ENABLED) return;
    const seriesInfo = vtParser.getSeriesInformation(path, seriesName, vtBuilder.virtualTree);
    console.log(seriesInfo);

    // Add data to database
    if (!DATABASE_ENABLED) return;
    console.log("Adding to database...");
    const dbManager = new DatabaseManager();    
    dbManager.commitToDB(path, seriesName, seriesInfo);
    console.log("Done adding to database.");
}