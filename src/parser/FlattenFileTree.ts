import Tree from './Tree';
import dirTree from 'directory-tree';

export interface DirectoryTreeCreator {
    treeFrom(path: string, exclude?: RegExp): Tree | undefined;
}

export class DirTree implements DirectoryTreeCreator {

    treeFrom(path: string, exclude?: RegExp | undefined): Tree | undefined {
        const parsedDirectory = dirTree(path, { exclude: exclude });
        
        return this.buildTree(parsedDirectory);
    }
    
    // post-order traversal
    // NOTE: this function could endup being in a cycle if a child node is pointing to a parent node
    private buildTree(node: dirTree.DirectoryTree): Tree {
        const children = node.children;
        let newChildren: Tree[] = [];

        if (children) 
            newChildren = children.map(child => this.buildTree(child));

        return new Tree(node.path, node.type, node.extension, newChildren);
    }
}


export class FlattenFileTree {
    dirTreeCreator: DirectoryTreeCreator;
    readonly exclude = /.DS_Store/;

    constructor(dirTreeCreator: DirectoryTreeCreator) {
        this.dirTreeCreator = dirTreeCreator;
    }

    flatten(path: string) {
        const directoryTree = this.dirTreeCreator.treeFrom(path, this.exclude);
        if (!(directoryTree && directoryTree.isFolder)) return;

        const move_up: string[] = [];
        let purge: string[] = [];
        const level4folders: Tree[] = [];

        directoryTree.levelOrderTraversal((node, level) => {
            if (level >= 3 && node.isVideo)
                move_up.push(node.path);

            if (level == 1 && node.isFolder)
                level4folders.push(node);

            if (level == 2 && (node.isFolder || !node.isVideo))
                purge.push(node.path);

            if (level == 1 && node.isFile && !node.isVideo)
                purge.push(node.path);
        });

        const filtered = level4folders.filter(folder => {
            const doesFolderHaveAVideo = folder.contains(node => node.isFile && node.isVideo);
            return !doesFolderHaveAVideo;
        }).map(node => node.path);

        purge = purge.concat(filtered);

        return {
            moveup: move_up,
            purge: purge
        };
    }
}
