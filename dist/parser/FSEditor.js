"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class FSEditor {
    makeDirectory(dirName) {
        if (!fs_1.default.existsSync(dirName))
            fs_1.default.mkdirSync(dirName);
    }
    moveAndRename(from, to) {
        fs_1.default.renameSync(from, to);
    }
    moveFile(from, to) {
        const basename = path_1.default.basename(from);
        const dest = path_1.default.resolve(to, basename);
        fs_1.default.renameSync(from, dest);
    }
}
