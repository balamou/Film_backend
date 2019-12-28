import { FSEditor } from './Adapters/FSEditor';
import { getDirTree } from './Adapters/DirTreeCreator';

import Tree from './Tree/Tree';
import ExecuteDifference from './ExecuteDifference';
import Orginizer from './Orginizer/Orginizer';
import OrginizerFactory from './Orginizer/Factory';
import TreeDifference from './Tree/TreeDifference';

import DirSnapshot from './DirSnapshot';

const GLOBAL_EXCLUDE = /.DS_Store|purge|rejected|dirSnapshot.yaml/;

const paths = [{ language: 'en', type: 'shows', path: 'public/en/shows' },
                { language: 'en', type: 'movies', path: 'public/en/movies' },
                { language: 'ru', type: 'shows', path: 'public/ru/shows' },
                { language: 'ru', type: 'movies', path: 'public/ru/movies' }];

export default function main() { // TODO: Rename to facade
    const path = 'public/en/shows';

    if (DirSnapshot.didSaveDirState(path)) {
        dirTreeComparison(path);
    } else {
        const orginizer = new Orginizer('en', new OrginizerFactory(), GLOBAL_EXCLUDE);
        orginizer.orginizeAllSeries(path);
        DirSnapshot.saveDirectoryStateOnDisk(path);
    }
}

function dirTreeComparison(path: string) {
    removeFiles(path); // remove files from path
    const tree = DirSnapshot.loadDirectoryStateFromFile(path);
    const currTree = getDirTree(path, GLOBAL_EXCLUDE);

    if (tree) {
        if (tree.hash() === currTree.hash()) {
            console.log("No changes in the file system.");
        } else {
            console.log("Changes occured!");
            const difference = TreeDifference.difference(tree, currTree);
            difference.print();
            const execDiff = new ExecuteDifference('en', new OrginizerFactory(), GLOBAL_EXCLUDE);
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
