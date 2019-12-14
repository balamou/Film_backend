"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Tree_1 = __importDefault(require("../Tree"));
const directory_tree_1 = __importDefault(require("directory-tree"));
class DirTree {
    treeFrom(path, exclude) {
        const parsedDirectory = directory_tree_1.default(path, { exclude: exclude });
        return this.buildTree(parsedDirectory);
    }
    // Post-order traversal
    // NOTE: this function could endup being in a cycle if a child node is pointing to a parent node
    buildTree(node) {
        const children = node.children;
        let newChildren = [];
        if (children)
            newChildren = children.map(child => this.buildTree(child));
        return new Tree_1.default(node.path, node.name, node.type, node.extension, newChildren);
    }
}
exports.DirTree = DirTree;
