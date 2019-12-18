import Tree from '../Tree';
import dirTree from 'directory-tree';

export interface DirectoryTreeCreator {
    treeFrom(path: string, exclude?: RegExp): Tree;
}

export class DirTree implements DirectoryTreeCreator {

    treeFrom(path: string, exclude?: RegExp | undefined): Tree {
        const parsedDirectory = dirTree(path, { exclude: exclude });

        return this.buildTree(parsedDirectory);
    }

    // Post-order traversal
    // NOTE: this function could endup being in a cycle if a child node is pointing to a parent node
    private buildTree(node: dirTree.DirectoryTree): Tree {
        const children = node.children;
        let newChildren: Tree[] = [];

        if (children)
            newChildren = children.map(child => this.buildTree(child));

        return new Tree(node.path, node.name, node.type, node.extension, newChildren);
    }
}

export function getDirTree(path: string, exclude?: RegExp | undefined) {
     return new DirTree().treeFrom(path, exclude);
}