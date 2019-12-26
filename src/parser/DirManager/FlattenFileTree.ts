import { DirectoryTreeCreator } from '../Adapters/DirTreeCreator';
import { FileSystemEditor, FSEditor } from '../Adapters/FSEditor';
import Tree from '../Tree/Tree';
import FilePurger from './FilePurger';
import Path from 'path';

export class FlattenFileTree {
    private readonly dirTreeCreator: DirectoryTreeCreator;
    private readonly fileSystemEditor: FileSystemEditor;
    private readonly purger: FilePurger;

    private readonly exclude = /.DS_Store|purge|rejected/;
    private readonly purgeFolder = 'purge';

    constructor(dirTreeCreator: DirectoryTreeCreator, fileSystemEditor: FileSystemEditor, purger: FilePurger = new FilePurger(new FSEditor())) {
        this.dirTreeCreator = dirTreeCreator;
        this.fileSystemEditor = fileSystemEditor;
        this.purger = purger;
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
     * Moves files to specified level
     * 
     * @param files [RELATIVE|ABSOLUTE] `files.path`
     * @param desiredLevel is the level desired to move files. It is relative to the `pathToFolder`
     */
    private moveFilesToLevel(files: {path: string, level: number}[], desiredLevel: number) {
        files.forEach(file => {
            const finalDir = this.folderAtDesiredLevel(file.path, file.level, desiredLevel);
            this.fileSystemEditor.moveFileToFolder(file.path, finalDir);
        });
    }

    private folderAtDesiredLevel(path: string, level: number, desiredLevel: number) {
        const truncateTail = level - desiredLevel + 1;
        const pathComponents = path.split('/').filter(x => x !== '');
        const dir = pathComponents.truncate(truncateTail);
        
        return Path.isAbsolute(path) ? Path.join('/', ...dir) : Path.join(...dir);
    }

    /**
     * Restructures and flattens the folder structure
     * 
     * @param pathToFolder [RELATIVE|ABSOLUTE] points to the series folder (it can be relative)
     */
    flatten(pathToFolder: string) {
        const filesToMove = this.findMisplacedFiles(pathToFolder);
        
        this.moveFilesToLevel(filesToMove.moveup, 2);
        this.purger.insertPaths(filesToMove.purge);
        this.purger.purge(`${pathToFolder}/${this.purgeFolder}`);
    }
}
