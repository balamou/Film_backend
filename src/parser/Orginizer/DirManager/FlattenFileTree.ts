import { DirectoryTreeCreator } from '../../Adapters/DirTreeCreator';
import { FileSystemEditor, FSEditor } from '../../Adapters/FSEditor';
import Tree from '../../Tree/Tree';
import FilePurger from './FilePurger';

class FlattenFileTree {
    private readonly dirTreeCreator: DirectoryTreeCreator;
    private readonly fileSystemEditor: FileSystemEditor;
    private readonly purger: FilePurger;

    private readonly exclude: RegExp;
    private readonly purgeFolder: string;

    constructor(dirTreeCreator: DirectoryTreeCreator, fileSystemEditor: FileSystemEditor)
    constructor(dirTreeCreator: DirectoryTreeCreator, fileSystemEditor: FileSystemEditor, purger?: FilePurger)
    constructor(dirTreeCreator: DirectoryTreeCreator, fileSystemEditor: FileSystemEditor, purger?: FilePurger, exclude?: RegExp, purgeFolder?: string) {
        this.dirTreeCreator = dirTreeCreator;
        this.fileSystemEditor = fileSystemEditor;
        this.purger = purger ?? new FilePurger(new FSEditor());

        this.exclude = exclude ?? /.DS_Store|purge|rejected/
        this.purgeFolder = purgeFolder ?? 'purge';
    }
    
    /**
     * Restructures and flattens the folder structure
     * 
     * @param pathToFolder [Relative|Absolute] points to the series folder
     */
    flatten(pathToFolder: string) {
        const { moveup, purge } = this.findMisplacedFiles(pathToFolder);
        const desiredLevel = 2;
 
        moveup.forEach(file => this.fileSystemEditor.moveFileToLevel(file.path, file.level, desiredLevel));
        
        this.purger.insertPaths(purge);
        this.purger.purge(`${pathToFolder}/${this.purgeFolder}`);
    }

    /**
     * Parses the directory tree to find paths that have to be moved higher up or are to be purged
     * 
     * @param pathToFolder [RELATIVE|ABSOLUTE] is the path to the series folder
    */
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

        return {
            moveup: moveUp,
            purge: [...purge, ...level1foldersWithNoVideos]
        };
    }
}

export default FlattenFileTree;