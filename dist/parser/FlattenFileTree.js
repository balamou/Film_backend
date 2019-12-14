"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FlattenFileTree {
    constructor(dirTreeCreator, fileSystemEditor) {
        this.exclude = /.DS_Store/;
        this.dirTreeCreator = dirTreeCreator;
        this.fileSystemEditor = fileSystemEditor;
    }
    findMisplacedFiles(path) {
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
        const filtered = level4folders.filter(folder => !folder.contains(node => node.isFile && node.isVideo)).map(node => node.path);
        purge = purge.concat(filtered);
        console.log(purge);
        return {
            moveup: move_up,
            purge: purge
        };
    }
    moveUp(files) {
        files.forEach(file => {
            const components = file.split('/');
            const level4folder = `${components[0]}/${components[1]}/${components[2]}/${components[3]}/${components[4]}/`;
            this.fileSystemEditor.moveFileToFolder(file, level4folder);
        });
    }
    flatten(path) {
        const result = this.findMisplacedFiles(path);
        const purgeFolder = `${path}/purge`;
        if (!result)
            return;
        this.moveUp(result.moveup);
        this.fileSystemEditor.makeDirectory(purgeFolder); // create purge folder
        result.purge.forEach(file => {
            this.fileSystemEditor.moveFileToFolder(file, purgeFolder);
        });
    }
}
exports.FlattenFileTree = FlattenFileTree;
