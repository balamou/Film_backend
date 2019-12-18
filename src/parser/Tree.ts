export default class Tree {
    readonly path: string;
    readonly name: string;
    readonly type: string;
    readonly extension: string | undefined;
    readonly children: Tree[];

    private readonly FILE = 'file';
    private readonly DIRECTORY = 'directory';

    constructor(path: string, name: string, type: string, extension: string | undefined, children: Tree[]) {
        this.path = path;
        this.name = name;
        this.type = type;
        this.extension = extension;
        this.children = children;
    }

    levelOrderTraversal = (onEach: (treeNode: Tree, level: number) => void) => {
        const queue = [this as Tree];
        let level = 0;
        while (queue.length > 0) {
            const size = queue.length;

            for (let i = 0; i < size; i++) {
                const currNode = queue.shift(); // `shift` is the same as `dequeue` in a queue
                if (!currNode) continue;
                const children = currNode.children;

                onEach(currNode, level);

                if (children)
                    children.forEach(item => queue.push(item));
            }

            level++;
        }
    };

    // BFS
    contains = (predicate: (node: Tree) => boolean) => {
        const queue = [this as Tree];

        while(queue.length > 0) {
            const currNode = queue.shift(); // `shift` is the same as `dequeue` in a queue
            if (!currNode) continue;
            const children = currNode.children;

            if (predicate(currNode)) return true;
            if (!children) continue;

            children.forEach((item: any) => queue.push(item));
        }
        return false;
    };

    get isFile(): boolean {
        return this.type === this.FILE;
    };

    get isFolder(): boolean {
        return this.type === this.DIRECTORY;
    };

    get isVideo(): boolean {
        if (!this.extension) return false;
        return this.isVideoFormat(this.extension);
    };
    
    private isVideoFormat = (extension: string) => {
        const supportedExtensions = ['.ASX', '.DTS', '.GXF', '.M2V', '.M3U', '.M4V', '.MPEG1', '.MPEG2', '.MTS', '.MXF', '.OGM', '.PLS', '.BUP', '.A52', '.AAC', '.B4S', '.CUE', '.DIVX', '.DV', '.FLV', '.M1V', '.M2TS', '.MKV', '.MOV', '.MPEG4', '.OMA', '.SPX', '.TS', '.VLC', '.VOB', '.XSPF', '.DAT', '.BIN', '.IFO', '.PART', '.3G2', '.AVI', '.MPEG', '.MPG', '.FLAC', '.M4A', '.MP1', '.OGG', '.WAV', '.XM', '.3GP', '.SRT', '.WMV', '.AC3', '.ASF', '.MOD', '.MP2', '.MP3', '.MP4', '.WMA', '.MKA', '.M4P'];
        return supportedExtensions.includes(extension.toUpperCase());
    }

    hash() {
        const preoder = this.preorder(this as Tree);
        return this.hashString(preoder);
    }

    // idk i got this from stack overflow
    private hashString(str: string) {
        let hash = 0, i, chr;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    private preorder(node: Tree): string {
        let result = node.path;

        if (node.children.length == 0)
            result += ":null:";
        else {
            const mapped = node.children.map( child => this.preorder(child) );
            const reduced = mapped.reduce((prev, curr) => prev + curr);
            result += ":" + reduced;
        }

        return result;
    }

    static instanciateFromJSON(tree: Tree): Tree {
        const children = tree.children;
        let newChildren: Tree[] = [];

        if (children)
            newChildren = children.map(child => this.instanciateFromJSON(child));

        return new Tree(tree.path, tree.name, tree.type, tree.extension, newChildren);
    }   

    static compare(lhs: Tree, rhs: Tree) {
        
    }
}