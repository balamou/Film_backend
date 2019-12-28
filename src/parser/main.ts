import { FSEditor } from './Adapters/FSEditor';
import { getDirTree } from './Adapters/DirTreeCreator';

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

export default function main() {
    const path = 'public/en/shows';
    const language = 'en';

    bulkSeriesRefresh(path, language);
}

/**
 * Checks if there are any changes in the `path` directory from the last refresh.
 * If there are changes, it looks at each change and retrieves/commits the appropriate data.
 * If no previosu refresh found it will do an initial parse through the series folder and
 * commit a `dirSnapshot.yml` file as the current dir state.
 * 
 * @param path to the folder with all the shows
 * @param language language of the shows
*/
function bulkSeriesRefresh(path: string, language: string) {
    if (DirSnapshot.didSaveDirState(path)) {
        dirTreeComparison(path, language);
    } else {
        const orginizer = new Orginizer(language, new OrginizerFactory(), GLOBAL_EXCLUDE);
        orginizer.orginizeAllSeries(path);
        DirSnapshot.saveDirectoryStateOnDisk(path, GLOBAL_EXCLUDE);
    }
}

/**
 * @param path to the folder with all shows
*/
function dirTreeComparison(path: string, language: string) {
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
        const execDiff = new ExecuteDifference(language, new OrginizerFactory(), GLOBAL_EXCLUDE);
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
