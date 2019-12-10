"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Tree {
    constructor(path, type, extension, children) {
        this.FILE = 'file';
        this.DIRECTORY = 'directory';
        this.levelOrderTraversal = (onEach) => {
            const queue = [this];
            let level = 0;
            while (queue.length > 0) {
                const size = queue.length;
                for (let i = 0; i < size; i++) {
                    const currNode = queue.shift(); // `shift` is the same as `dequeue` in a queue
                    if (!currNode)
                        continue;
                    const children = currNode.children;
                    onEach(currNode, level);
                    if (children)
                        children.forEach(item => queue.push(item));
                }
                level++;
            }
        };
        // BFS
        this.contains = (predicate) => {
            const queue = [this];
            while (queue.length > 0) {
                const currNode = queue.shift(); // `shift` is the same as `dequeue` in a queue
                if (!currNode)
                    continue;
                const children = currNode.children;
                if (predicate(currNode))
                    return true;
                if (!children)
                    continue;
                children.forEach((item) => queue.push(item));
            }
        };
        this.isVideoFormat = (extension) => {
            const supportedExtensions = ['.ASX', '.DTS', '.GXF', '.M2V', '.M3U', '.M4V', '.MPEG1', '.MPEG2', '.MTS', '.MXF', '.OGM', '.PLS', '.BUP', '.A52', '.AAC', '.B4S', '.CUE', '.DIVX', '.DV', '.FLV', '.M1V', '.M2TS', '.MKV', '.MOV', '.MPEG4', '.OMA', '.SPX', '.TS', '.VLC', '.VOB', '.XSPF', '.DAT', '.BIN', '.IFO', '.PART', '.3G2', '.AVI', '.MPEG', '.MPG', '.FLAC', '.M4A', '.MP1', '.OGG', '.WAV', '.XM', '.3GP', '.SRT', '.WMV', '.AC3', '.ASF', '.MOD', '.MP2', '.MP3', '.MP4', '.WMA', '.MKA', '.M4P'];
            return supportedExtensions.includes(extension.toUpperCase());
        };
        this.path = path;
        this.type = type;
        this.extension = extension;
        this.children = children;
    }
    get isFile() {
        return this.type === this.FILE;
    }
    ;
    get isFolder() {
        return this.type === this.DIRECTORY;
    }
    ;
    get isVideo() {
        return this.isVideoFormat(this.extension);
    }
    ;
}
exports.default = Tree;
