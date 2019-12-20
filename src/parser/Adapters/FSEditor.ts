export interface FileSystemEditor {
    makeDirectory(dirName: string): void;
    moveAndRename(from: string, to: string): void;
    moveFileToFolder(from: string, to: string): void;
    doesFileExist(path: string): boolean;
    deleteFile(path: string): void;
    readFile(path: string): string;
    writeToFile(path: string, data: string): void;
}

import fs from 'fs';
import path from 'path';

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
            const basename = path.basename(from);
            const dest = path.resolve(to, basename);

            fs.renameSync(from, dest);
        } catch (error) {
            if (error.code === this.RENAME_ERROR) {
                const basename = path.basename(from);
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
        return path.basename(paths);
    }

    writeToFile(path: string, data: string) {
        fs.writeFileSync(path, data);
    }

    readFile(path: string) {
        return fs.readFileSync(path).toString();
    }
}