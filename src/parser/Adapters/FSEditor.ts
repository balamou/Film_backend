export interface FileSystemEditor {
    makeDirectory(dirName: string): void;
    moveAndRename(from: string, to: string): void;
    moveFileToFolder(from: string, to: string): void;
    doesFileExist(path: string): boolean;
    deleteFile(path: string): void;
    readFile(path: string): string;
    writeToFile(path: string, data: string): void;
    moveFileToLevel(filePath: string, level: number, desiredLevel: number): void;
}

import fs from 'fs';
import Path from 'path';

export class FSEditor implements FileSystemEditor {
    private readonly RENAME_ERROR = 'ENOTEMPTY';

    makeDirectory(dirName: string) {
        if (!fs.existsSync(dirName))
            fs.mkdirSync(dirName);
    }

    moveAndRename(from: string, to: string) {
        fs.renameSync(from, to);
    }

    moveFileToFolder(from: string, to: string) {
        try {
            const basename = Path.basename(from);
            const dest = Path.resolve(to, basename);

            fs.renameSync(from, dest);
        } catch (error) {
            if (error.code === this.RENAME_ERROR) {
                const basename = Path.basename(from);
                this.handleNameCollision(from, to, basename);
            }
        }
    }

    private handleNameCollision(from: string, toFolder: string, basename: string, index: number = 1) {
        try {
            fs.renameSync(from, `${toFolder}/${basename}_copy${index}`);
        } catch (error) {
            if (error.code === this.RENAME_ERROR)
               this.handleNameCollision(from, toFolder, basename, ++index);
        }
    }

    doesFileExist(path: string): boolean {
        try {
            return fs.existsSync(path);
        } catch (err) {
            return false; // error occured 
        }
    }

    deleteFile(path: string) {
        if (this.doesFileExist(path))
            fs.unlinkSync(path);
    }

    getBasename(paths: string): string {
        return Path.basename(paths);
    }

    writeToFile(path: string, data: string) {
        fs.writeFileSync(path, data);
    }

    readFile(path: string) {
        return fs.readFileSync(path).toString();
    }

    /**
     * Moves file up the directory tree to a desired level.
     * For example the file `a/b/c/d/e.png` is at level 3 and the desired level is 1.
     * It means the file `e.png` is at level 3 and wants to move up to the same level as
     * the folder `c`. The resulting path for `e.png` will be `a/b/e.png`.
     * 
     * @param files [Relative|Absolute] `files.path`
     * @param desiredLevel is the level desired to move files. It is relative to the `pathToFolder`
     */
    moveFileToLevel(filePath: string, level: number, desiredLevel: number) {
        const finalDir = this.removeSubpaths(filePath, level - desiredLevel + 1);
        this.moveFileToFolder(filePath, finalDir);
    }

    /**
     * Removes subpaths from the end of a path.
     * 
     * Example the path `a/b/c/d/e` after removing 2 levels becomes `a/b/c`.
     * This function preserves the type of the path, relative or absolute.
     * 
     * @param path relative or absolute path
    */
    private removeSubpaths(path: string, levelsToRemove: number) {
        const pathComponents = path.split('/').filter(x => x !== '');
        const dir = pathComponents.truncate(levelsToRemove);
        
        return Path.isAbsolute(path) ? Path.join('/', ...dir) : Path.join(...dir);
    }
}