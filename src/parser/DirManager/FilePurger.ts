import { FileSystemEditor } from '../Adapters/FSEditor';
import '../Tree/Array';

type Node = { path: string, markedPath: boolean, nestedPaths: Node[] };

/**
 * File purger implemented using a Trie data structure
*/
class FilePurger {
    private readonly fsEditor: FileSystemEditor;
    private rootNode: Node = { path: '*', markedPath: false, nestedPaths: [] };

    constructor(fsEditor: FileSystemEditor, paths?: string[]) {
        this.fsEditor = fsEditor;

        paths?.forEach(path => this.insertPath(path));
    }

    insertPath(path: string) {
        const components = path.split('/').filter(x => x !== '');

        this.insertNode(this.rootNode, components, 0);
    }

    insertPaths(paths: string[]) {
        paths.forEach(path => this.insertPath(path));
    }

    private insertNode(node: Node, pathComponents: string[], currentComponent: number) {
        const target = node.nestedPaths.find(x => x.path === pathComponents[currentComponent]);

        if (target) {
            if (currentComponent === pathComponents.length - 1) 
                target.markedPath = true;
            else
                this.insertNode(target, pathComponents, currentComponent + 1);
        } else {
            let prevNode = node;

            for (let i = currentComponent; i < pathComponents.length; i++) {
                const newNode = { path: pathComponents[i], markedPath: false, nestedPaths: [] };
                prevNode.nestedPaths.push(newNode);
                prevNode = newNode;
            }

            prevNode.markedPath = true;
        }
    }

    get purgeList(): string[] {
        return this.preoder(this.rootNode, '');
    }

    private preoder(node: Node, currentPath: string): string[] {
        const path = node.path === '*' ? '' : `/${node.path}`;
        const resultPath = `${currentPath}${path}`;

        if (node.markedPath)
            return [resultPath.substring(1)]; // remove front slash
        else
            return node.nestedPaths.flatMap(x => this.preoder(x, resultPath));
    }

    purge(purgeDirectory: string) {
        this.fsEditor.makeDirectory(purgeDirectory);
        this.purgeList.forEach(path => this.fsEditor.moveFileToFolder(path, purgeDirectory));
    }
}

export default FilePurger;