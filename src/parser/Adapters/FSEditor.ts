export interface FileSystemEditor {
    makeDirectory(dirName: string): void;
    moveAndRename(from: string, to: string): void;
    moveFileToFolder(from: string, to: string): void;
    doesFileExist(path: string): boolean;
    deleteFile(path: string): void;
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
            console.log(`${toFolder}/${basename}_copy${index}`);
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
        fs.unlinkSync(path);
    }
}