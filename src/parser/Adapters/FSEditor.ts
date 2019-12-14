export interface FileSystemEditor {
    makeDirectory(dirName: string): void;
    moveAndRename(from: string, to: string): void;
    moveFileToFolder(from: string, to: string): void;
}

import fs from 'fs';
import path from 'path';

export class FSEditor implements FileSystemEditor {
    
    makeDirectory(dirName: string) {
        if (!fs.existsSync(dirName))
            fs.mkdirSync(dirName);
    }
    
    moveAndRename(from: string, to: string) {
        fs.renameSync(from, to);
    }
    
    moveFileToFolder(from: string, to: string) {
        const basename = path.basename(from);
        const dest = path.resolve(to, basename);
        
        fs.renameSync(from, dest);
    }
}