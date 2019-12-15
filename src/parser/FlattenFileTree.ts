import { DirectoryTreeCreator } from './Adapters/DirTreeCreator';
import { FileSystemEditor } from './Adapters/FSEditor';
import Tree from './Tree';

export class FlattenFileTree {
    private dirTreeCreator: DirectoryTreeCreator;
    private fileSystemEditor: FileSystemEditor;
    private readonly exclude = /.DS_Store|purge/;

    constructor(dirTreeCreator: DirectoryTreeCreator, fileSystemEditor: FileSystemEditor) {
        this.dirTreeCreator = dirTreeCreator;
        this.fileSystemEditor = fileSystemEditor;
    }

    // `pathToFolder` is the path to the series folder
    private findMisplacedFiles(pathToFolder: string) {
        const directoryTree = this.dirTreeCreator.treeFrom(pathToFolder, this.exclude);

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

        const filtered = level4folders.filter(folder =>
            !folder.contains(node => node.isVideo)
        ).map(node => node.path);

        purge = purge.concat(filtered);
        
        return {
            moveup: move_up,
            purge: purge
        };
    }

    private moveUp(files: string[]) {
        files.forEach(file => {
            const components = file.split('/');
            //                          public     /      en        /     shows      /    TheShow     /   Season_1
            const level4folder = `${components[0]}/${components[1]}/${components[2]}/${components[3]}/${components[4]}/`;

            this.fileSystemEditor.moveFileToFolder(file, level4folder);
        });
    }

    // `path` points to the series folder
    flatten(path: string) {
        const result = this.findMisplacedFiles(path);
        const purgeFolder = `${path}/purge`;

        this.moveUp(result.moveup);

        this.fileSystemEditor.makeDirectory(purgeFolder); // create purge folder
        result.purge.forEach(file => {
            this.fileSystemEditor.moveFileToFolder(file, purgeFolder);
        });
    }
}
