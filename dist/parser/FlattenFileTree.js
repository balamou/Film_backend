"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Tree_1 = __importDefault(require("./Tree"));
const directory_tree_1 = __importDefault(require("directory-tree"));
class DirTree {
    treeFrom(path, exclude) {
        const parsedDirectory = directory_tree_1.default(path, { exclude: exclude });
        return this.buildTree(parsedDirectory);
    }
    // post-order traversal
    // NOTE: this function could endup being in a cycle if a child node is pointing to a parent node
    buildTree(node) {
        const children = node.children;
        let newChildren = [];
        if (children)
            newChildren = children.map(child => this.buildTree(child));
        return new Tree_1.default(node.path, node.type, node.extension, newChildren);
    }
}
exports.DirTree = DirTree;
class FlattenFileTree {
    constructor(dirTreeCreator) {
        this.exclude = /.DS_Store/;
        this.dirTreeCreator = dirTreeCreator;
    }
    flatten(path) {
        const directoryTree = this.dirTreeCreator.treeFrom(path, this.exclude);
        if (!(directoryTree && directoryTree.isFolder))
            return;
        const move_up = [];
        let purge = [];
        const level4folders = [];
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
exports.FlattenFileTree = FlattenFileTree;
