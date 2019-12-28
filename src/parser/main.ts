import { FSEditor } from './Adapters/FSEditor';
import { getDirTree } from './Adapters/DirTreeCreator';

import Tree from './Tree/Tree';
import ExecuteDifference from './ExecuteDifference';
import Orginizer from './Orginizer/Orginizer';
import OrginizerFactory from './Orginizer/Factory';
import TreeDifference from './Tree/TreeDifference';

import DirSnapshot from './DirSnapshot';
import FilePurger from './DirManager/FilePurger';

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
        DirSnapshot.saveDirectoryStateOnDisk(path, GLOBAL_EXCLUDE);
    }
}

function dirTreeComparison(path: string) {
    removeFiles(path); // remove files from path
    const beforeTree = DirSnapshot.loadDirectoryStateFromFile(path);
    const afterTree = getDirTree(path, GLOBAL_EXCLUDE);

    if (!beforeTree) return;

    if (beforeTree.hash() === afterTree.hash()) {
        console.log(["No changes in the file system."]);
    } else {
        console.log(["Changes occured!"]);
        
        const difference = TreeDifference.difference(beforeTree, afterTree);
        difference.print();
        const execDiff = new ExecuteDifference('en', new OrginizerFactory(), GLOBAL_EXCLUDE);
        execDiff.execute(difference);
        // TODO: resave dir state
    }
}

function removeFiles(path: string) {
    const tree = getDirTree(path, GLOBAL_EXCLUDE);
    const purge = tree.children.filter(child => child.isFile).map(x => x.path);

    const purger = new FilePurger(new FSEditor());
    purger.insertPaths(purge);
    purger.purge(`${path}/purge`);
}
