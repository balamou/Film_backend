import { FSEditor } from "../Adapters/FSEditor";
import { DirTree } from "../Adapters/DirTreeCreator";
import Tree from "../Tree/Tree";
import YAML from 'yaml';

export default class DirSnapshot {
    private static readonly fsEditor = new FSEditor();
    private static readonly dirTree = new DirTree();

    private static readonly fileName = 'dirSnapshot.yaml';

    /**
     * @param path points to the shows/movies directory
    */
    static saveDirectoryStateOnDisk(path: string, exclude?: RegExp) {
        const tree = this.dirTree.treeFrom(path, exclude);
        const dataToYaml = (data: any) => YAML.stringify(JSON.parse(JSON.stringify(data)));

        this.fsEditor.writeToFile(`${path}/${this.fileName}`, dataToYaml(tree));
    }

    /**
     * @param path points to the shows/movies directory
    */
    static loadDirectoryStateFromFile(path: string) {
        if (!this.didSaveDirState(path)) return;

        try {
            const data = this.fsEditor.readFile(`${path}/${this.fileName}`);
            const tree = YAML.parse(data) as Tree;

            return Tree.appendMissingMethodsTo(tree);
        } catch {
            console.log(`Error loading or decoding '${this.fileName}' file`);
        }
    }

    /**
     * @param path points to the shows/movies directory
    */
    static didSaveDirState(path: string) {
        return this.fsEditor.doesFileExist(`${path}/${this.fileName}`);
    }
}