import { DirectoryTreeCreator } from '../Adapters/DirTreeCreator';
import { FileSystemEditor, FSEditor } from '../Adapters/FSEditor';
import Tree from '../Tree/Tree';
import FilePurger from './FilePurger';
import Path from 'path';

export class FlattenFileTree {
    private dirTreeCreator: DirectoryTreeCreator;
    private fileSystemEditor: FileSystemEditor;
    private readonly exclude = /.DS_Store|purge|rejected/;

    constructor(dirTreeCreator: DirectoryTreeCreator, fileSystemEditor: FileSystemEditor) {
        this.dirTreeCreator = dirTreeCreator;
        this.fileSystemEditor = fileSystemEditor;
    }

    // `pathToFolder` is the path to the series folder
    private findMisplacedFiles(pathToFolder: string) {
        const directoryTree = this.dirTreeCreator.treeFrom(pathToFolder, this.exclude);

        const moveUp: {path: string, level: number}[] = [];
        let purge: string[] = [];
        const level1folders: Tree[] = []; // folder corresponds to a folder inside season folder

        directoryTree.levelOrderTraversal((node, level) => {
            if (level == 1 && node.isFolder)
                level1folders.push(node);

            if (level == 1 && node.isFile && !node.isVideo)
                purge.push(node.path);

            if (level == 2 && (node.isFolder || !node.isVideo))
                purge.push(node.path);

            if (level >= 3 && node.isVideo)
                moveUp.push({path: node.path, level: level});
        });

        const level1foldersWithNoVideos = level1folders.filter(folder => !folder.contains(node => node.isVideo)).map(node => node.path);

        purge = purge.concat(level1foldersWithNoVideos);
        
        return {
            moveup: moveUp,
            purge: purge
        };
    }

    /**
     * @param files `files.path` has to be absolute
     * @param desiredLevel is the level desired to move files. It is relative to the `pathToFolder`
     */
    private moveUp(files: {path: string, level: number}[], desiredLevel: number = 2) {
        files.forEach(file => {
            const truncateTail = file.level - desiredLevel + 1;
            const dir = file.path.split('/').filter(x => x !== '').truncate(truncateTail);
            const finalDir = Path.join('/', ...dir);

            this.fileSystemEditor.moveFileToFolder(file.path, finalDir);
        });
    }

    /**
     * Restructures and flattens the folder structure
     * 
     * @param pathToFolder points to the series folder (it can be relative)
     */
    flatten(pathToFolder: string) {
        const filesToMove = this.findMisplacedFiles(pathToFolder);
        this.moveUp(filesToMove.moveup);

        const purger = new FilePurger(new FSEditor(), filesToMove.purge);
        purger.purge(`${pathToFolder}/purge`);
    }
}
