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

    // `pathToFolder` [RELATIVE|ABSOLUTE] is the path to the series folder
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
     * @param files [ABSOLUTE] `files.path` has to be absolute
     * @param desiredLevel is the level desired to move files. It is relative to the `pathToFolder`
     */
    private moveUp(files: {path: string, level: number}[], desiredLevel: number) {
        files.forEach(file => {
            const finalDir = this.folderAtDesiredLevel(file.path, file.level, desiredLevel);
            this.fileSystemEditor.moveFileToFolder(file.path, finalDir);
        });
    }

    private folderAtDesiredLevel(path: string, level: number, desiredLevel: number) {
        const truncateTail = level - desiredLevel + 1;
        const pathComponents = path.split('/').filter(x => x !== '');
        const dir = pathComponents.truncate(truncateTail);
        
        return Path.join('/', ...dir);
    }

    /**
     * Restructures and flattens the folder structure
     * 
     * @param pathToFolder [RELATIVE|ABSOLUTE] points to the series folder (it can be relative)
     */
    flatten(pathToFolder: string) {
        const filesToMove = this.findMisplacedFiles(pathToFolder);
        this.moveUp(filesToMove.moveup, 2);

        const purger = new FilePurger(new FSEditor(), filesToMove.purge);
        purger.purge(`${pathToFolder}/purge`);
    }
}
