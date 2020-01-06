import { FileSystemEditor } from '../../Adapters/FSEditor';
import '../../Tree/Array';
import Path from 'path';

type Node = { path: string, markedPath: boolean, nestedPaths: Node[] };

/**
 * File purger implemented using a Trie data structure
*/
class FilePurger {
    private readonly fsEditor: FileSystemEditor;
    private rootNode: Node = { path: '*', markedPath: false, nestedPaths: [] };
    private isAbsolutePath?: boolean;

    constructor(fsEditor: FileSystemEditor, paths?: string[]) {
        this.fsEditor = fsEditor;

        paths?.forEach(path => this.insertPath(path));
    }

    insertPath(path: string) {
        if (this.isAbsolutePath === undefined) {
            this.isAbsolutePath = Path.isAbsolute(path);
        } else {
            if (this.isAbsolutePath !== Path.isAbsolute(path)) 
                return; // ignore this path
        }

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

        if (node.markedPath) {
            const isAbsolutePath = this.isAbsolutePath!;
            return [isAbsolutePath ? resultPath : resultPath.substring(1)];
        } else {
            return node.nestedPaths.flatMap(x => this.preoder(x, resultPath));
        }
    }

    /**
     * If no paths added it does nothing. Else it creates a new folder if it does not exist (`purgeDirectory`) 
     * and moves all inserted paths into it. No paths will be left after execution.
     * 
     * @param purgeDirectory directory all files/folders are moved to
    */
    purge(purgeDirectory: string) {
        if (this.rootNode.nestedPaths.length === 0) return;

        this.fsEditor.makeDirectory(purgeDirectory);
        this.purgeList.forEach(path => this.fsEditor.moveFileToFolder(path, purgeDirectory));
        this.rootNode.nestedPaths = []; // clear the tree
    }
}

export default FilePurger;