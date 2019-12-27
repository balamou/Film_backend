import { FSEditor } from './Adapters/FSEditor';
import { getDirTree } from './Adapters/DirTreeCreator';
import Tree from './Tree/Tree';
import diffTrees from './Tree/DiffTrees';
import ExecuteDifference from './ExecuteDifference';
import Orginizer from './Orginizer/Orginizer';
import OrginizerFactory from './Orginizer/Factory';

const GLOBAL_EXCLUDE = /.DS_Store|purge|rejected|film.config/;

const paths = [{ language: 'en', type: 'shows', path: '/public/en/shows' },
                { language: 'en', type: 'movies', path: '/public/en/movies' },
                { language: 'ru', type: 'shows', path: '/public/ru/shows' },
                { language: 'ru', type: 'movies', path: '/public/ru/movies' }];

export default function main() { // TODO: Rename to facade
    const fsEditor = new FSEditor();
    const path = './public/en/shows';

    if (fsEditor.doesFileExist(`${path}/film.config`)) {
        dirTreeComparison(path);
    } else {
        const orginizer = new Orginizer('en', new OrginizerFactory(), GLOBAL_EXCLUDE);
        orginizer.orginizeAllSeries(path);
        saveDirectoryStateOnDisk(path);
    }
}

function dirTreeComparison(path: string) {
    removeFiles(path); // remove files from path
    const tree = loadDirectoryStateFromFile(path);
    const currTree = getDirTree(path, GLOBAL_EXCLUDE);

    if (tree) {
        if (tree.hash() === currTree.hash()) {
            console.log("No changes in the file system.");
        } else {
            console.log("Changes occured!");
            const difference = diffTrees(tree, currTree);
            difference.print();
            const execDiff = new ExecuteDifference(new FSEditor(), (seriesPath: string) => {}); // TODO: move to the factory
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

function purgeFiles(path: string, files: Tree[]) {
    const fsEditor = new FSEditor();
    const purgeFolder = `${path}/purge`;
    fsEditor.makeDirectory(purgeFolder);
    files.forEach(file => fsEditor.moveFileToFolder(file.path, purgeFolder));
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
