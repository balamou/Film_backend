import { FileSystemEditor } from '../Adapters/FSEditor';
import '../Tree/Array';

type Node = {path: string, markedPath: boolean, nestedPaths: Node[]};

/**
 * Using a Trie data structure
*/
class FilePurger {
    private readonly fsEditor: FileSystemEditor;
    private rootNode: Node = { path: "*", markedPath: false, nestedPaths: [] };

    constructor(fsEditor: FileSystemEditor, paths?: string[]) {
        this.fsEditor = fsEditor;

        paths?.forEach(path => this.insertPath(path));
    }

    insertPath(path: string) {
        const components = path.split('/').filter(x => x !== '');

        this.insertNode(this.rootNode, components, 0);
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
        return this.explore(this.rootNode, '');
    }

    explore(node: Node, currentPath: string): string[] {
        const path = node.path === '*' ? '' : `/${node.path}`;
        const resultPath = `${currentPath}${path}`;

        if (node.markedPath)
            return [resultPath];
        else
            return node.nestedPaths.flatMap(x => this.explore(x, resultPath));
    }

    purge() {

    }

    get root(): Node { // defined for test access
        return this.rootNode;
    }
}

export default FilePurger;