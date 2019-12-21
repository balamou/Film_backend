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
    let didNotChange = cachedLevel1.filter(x => currentLevel1.includesTree(x));

    console.log("Deleted: ", deletedSeries.map(x => x.path));
    console.log("Added: ", addedSeries.map(x => x.path));
    console.log("Did not change: ", didNotChange.map(x => x.path));
}


  