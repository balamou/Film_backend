import { FSEditor } from './Adapters/FSEditor';
import { getDirTree, DirTree } from './Adapters/DirTreeCreator';

import Tree from './Tree/Tree';
import YAML from 'yaml';
import diffTrees from './Tree/DiffTrees';
import ExecuteDifference from './ExecuteDifference';
import Orginizer from './Orginizer/Orginizer';
import OrginizerFactory from './Orginizer/Factory';

const GLOBAL_EXCLUDE = /.DS_Store|purge|rejected|film.yaml/;

const paths = [{ language: 'en', type: 'shows', path: '/public/en/shows' },
                { language: 'en', type: 'movies', path: '/public/en/movies' },
                { language: 'ru', type: 'shows', path: '/public/ru/shows' },
                { language: 'ru', type: 'movies', path: '/public/ru/movies' }];

export default function main() { // TODO: Rename to facade
    const path = './public/en/shows';

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

class DirSnapshot {
    private static readonly fsEditor = new FSEditor();
    private static readonly dirTree = new DirTree();

    private static readonly fileName = 'dirSnapshot.yaml';

    /**
     * @param path points to the shows/movies directory
    */
    static saveDirectoryStateOnDisk(path: string) {
        const tree = this.dirTree.treeFrom(path, GLOBAL_EXCLUDE);
        const dataToYaml = (data: any) => YAML.stringify(JSON.parse(JSON.stringify(data)));

        this.fsEditor.writeToFile(`${path}/${this.fileName}`, dataToYaml(tree));
    }

    /**
     * @param path points to the shows/movies directory
    */
    static loadDirectoryStateFromFile(path: string): Tree | undefined {
        try {
            const data = this.fsEditor.readFile(`${path}/${this.fileName}`);
            const tree = YAML.parse(data) as Tree;

            return Tree.appendMissingMethodsTo(tree);
        } catch {
            console.log(`Error loading or decoding '${this.fileName}' file`);
            return undefined;
        }
    }

    /**
     * @param path points to the shows/movies directory
    */
    static didSaveDirState(path: string) {
        return this.fsEditor.doesFileExist(`${path}/${this.fileName}`)
    }
}