import { FSEditor } from './Adapters/FSEditor';
import { getDirTree } from './Adapters/DirTreeCreator';

import DifferenceOrginizer from './Orginizer/DifferenceOrginizer';
import Orginizer from './Orginizer/Orginizer';
import OrginizerFactory from './Orginizer/Factory';
import TreeDifference from './Tree/TreeDifference';

import DirSnapshot from './DirSnapshot';
import FilePurger from './Orginizer/DirManager/FilePurger';
class Facade {
    private static readonly GLOBAL_EXCLUDE = /.DS_Store|purge|rejected|dirSnapshot.yaml/;

    private static get factory() {
        return {
            getFilePurger: () => new FilePurger(new FSEditor()),
            getOrginizer: (language: string) => new Orginizer(language, new OrginizerFactory(), this.GLOBAL_EXCLUDE),
            getDifferenceOrginizer: (language: string) => new DifferenceOrginizer(language, new OrginizerFactory(), this.GLOBAL_EXCLUDE)
        };
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
    static bulkSeriesRefresh(path: string, language: string) {
        if (DirSnapshot.didSaveDirState(path)) {
            this.dirTreeComparison(path, language);
        } else {
            const orginizer = this.factory.getOrginizer(language);
            orginizer.orginizeAllSeries(path);
            DirSnapshot.saveDirectoryStateOnDisk(path, this.GLOBAL_EXCLUDE);
        }
    }

    /**
     * @param path to the folder with all shows
    */
    static dirTreeComparison(path: string, language: string) {
        const log = console.log;

        this.removeFiles(path); // remove files from path
        const beforeTree = DirSnapshot.loadDirectoryStateFromFile(path);
        const afterTree = getDirTree(path, this.GLOBAL_EXCLUDE);

        if (!beforeTree) return log(`Error parsing tree from directory snapshot '${path}/dirSnapshot.yml'`);

        if (beforeTree.hash() === afterTree.hash()) {
            log([`No changes in '${language}' series subdirectory.`]);
        } else {
            log([`Changes occured in '${language}' series subdirectory!`]);

            const difference = TreeDifference.difference(beforeTree, afterTree);
            difference.print();
            const execDiff = this.factory.getDifferenceOrginizer(language);
            execDiff.execute(difference);

            DirSnapshot.saveDirectoryStateOnDisk(path, this.GLOBAL_EXCLUDE);
        }
    }

    static removeFiles(path: string) {
        const tree = getDirTree(path, this.GLOBAL_EXCLUDE);
        const purge = tree.children.filter(child => child.isFile).map(x => x.path);

        const purger = this.factory.getFilePurger();
        purger.insertPaths(purge);
        purger.purge(`${path}/purge`);
    }
}

export default Facade;