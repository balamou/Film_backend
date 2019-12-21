import Tree from "./Tree";

declare global {
    interface Array<T> {
      includesTree(this: Tree[], tree: Tree): boolean;
    }  
}

function includesTree(this: Tree[], tree: Tree): boolean {
    for (let node of this) {
        if (node.name === tree.name) {
            return true;
        }
    }

    return false;
}

Array.prototype.includesTree = includesTree;

export default function diffTrees(cached: Tree, current: Tree) {
    const currentLevel1: Tree[] = current.children;
    const cachedLevel1: Tree[] = cached.children;
    
    let deletedSeries = cachedLevel1.filter(x => !currentLevel1.includesTree(x));
    let addedSeries = currentLevel1.filter(x => !cachedLevel1.includesTree(x));
    let modified = getModified(cachedLevel1, currentLevel1);

    console.log("Deleted: ", deletedSeries.map(x => x.path));
    console.log("Added: ", addedSeries.map(x => x.path));
    console.log("Did not change: ", modified.didNotChange.map(x => x.path));
    console.log("Contents modified: ", modified.contentsModified.map(x => x.path));
}

function getModified(cached: Tree[], current: Tree[]) {
    const didNotChange: Tree[] = []; 
    const contentsModified: Tree[] = [];

    cached.forEach(folder => {
        const matchingFolder = current.find(x => x.name === folder.name);
        if (!matchingFolder) return; // folder deleted

        if (folder.hash() === matchingFolder.hash()) {
            didNotChange.push(matchingFolder);
        } else {
            contentsModified.push(matchingFolder);
        }
    });

    return {
        didNotChange: didNotChange,
        contentsModified: contentsModified
    };
}


  