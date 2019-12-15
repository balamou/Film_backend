"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class FSEditor {
    constructor() {
        this.RENAME_ERROR = 'ENOTEMPTY';
    }
    makeDirectory(dirName) {
        if (!fs_1.default.existsSync(dirName))
            fs_1.default.mkdirSync(dirName);
    }
    moveAndRename(from, to) {
        fs_1.default.renameSync(from, to);
    }
    moveFileToFolder(from, to) {
        try {
            const basename = path_1.default.basename(from);
            const dest = path_1.default.resolve(to, basename);
            fs_1.default.renameSync(from, dest);
        }
        catch (error) {
            if (error.code === this.RENAME_ERROR) {
                const basename = path_1.default.basename(from);
                this.handleNameCollision(from, to, basename);
            }
        }
    }
    handleNameCollision(from, toFolder, basename, index = 1) {
        try {
            console.log(`${toFolder}/${basename}_copy${index}`);
            fs_1.default.renameSync(from, `${toFolder}/${basename}_copy${index}`);
        }
        catch (error) {
            if (error.code === this.RENAME_ERROR)
                this.handleNameCollision(from, toFolder, basename, ++index);
        }
    }
    doesFileExist(path) {
        try {
            return fs_1.default.existsSync(path);
        }
        catch (err) {
            return false; // error occured 
        }
    }
    deleteFile(path) {
        fs_1.default.unlinkSync(path);
    }
}
exports.FSEditor = FSEditor;
