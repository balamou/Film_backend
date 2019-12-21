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

    console.log(intersection(cachedLevel1, currentLevel1, (l, r) => l.name === r.name).map((val) => {
        return `${val[0].name} -> ${val[0].hash()} == ${val[1].hash()}`;
    }));
    console.log("Deleted: ", deletedSeries.map(x => x.path));
    console.log("Added: ", addedSeries.map(x => x.path));
    console.log("Did not change: ", modified.didNotChange.map(x => x.path));
    console.log("Contents modified: ", modified.contentsModified.map(x => x.path));
}

function getModified(cached: Tree[], current: Tree[]) {
    const didNotChange: Tree[] = []; 
    const contentsModified: Tree[] = [];

    const pairs = intersection(cached, current, (l, r) => l.name === r.name);

    pairs.forEach(pair => {
        if (pair[0].hash() === pair[1].hash())
            didNotChange.push(pair[1]);
        else
            contentsModified.push(pair[1]);
    });

    return {
        didNotChange: didNotChange,
        contentsModified: contentsModified
    };
}


// Returns an array of pairs where each pair contains a left object from lhs array 
// and right object from rhs array, that both returned true to `predicate(left obj, right obj)`
//
// Runs in O(n^2) where n is the size of the largest array between `lhs` and `rhs`
// Note: the runtime can be improved to O(n*log(n)) by sorting each array first 
function intersection(lhs: Tree[], rhs: Tree[], predicate: (lhs: Tree, rhs: Tree) => boolean) {
    const result: [Tree, Tree][] = [];

    lhs.forEach(node => {
        const matchingNode = rhs.find(x => predicate(node, x));

        if (!matchingNode) return;

        result.push([node, matchingNode]);
    });

    return result;
}


  