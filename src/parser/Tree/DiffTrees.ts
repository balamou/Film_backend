import Tree from "./Tree";

declare global {
    interface Array<T> {
      includesTree(this: Tree[], tree: Tree): boolean;
      intersect<T>(this: T[], rhs: T[], predicate: (lhs: T, rhs: T) => boolean): [T, T][];
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

// Returns an array of pairs where each pair contains a left object from lhs array 
// and a right object from rhs array. Each pari evaluates to true with the equality 
// predicate `equalityPredicate(left_obj, right_obj)`.
//
// Runs in O(n^2) where n is the size of the largest array between `lhs` and `rhs`.
// Note: the runtime can be improved to O(n*log(n)) by sorting each array first.
function intersect<T>(this: T[], rhs: T[], equalityPredicate: (lhs: T, rhs: T) => boolean) {
    const result: [T, T][] = [];

    this.forEach(value => {
        const matchingObject = rhs.find(x => equalityPredicate(value, x));

        if (!matchingObject) return;

        result.push([value, matchingObject]);
    });

    return result;
}

Array.prototype.includesTree = includesTree;
Array.prototype.intersect = intersect;

export default function diffTrees(cached: Tree, current: Tree) {
    const difference = diff(cached, current);

    // PRINT RESULTS vvvv
    console.log("Deleted: ", difference.deleted.map(x => x.name)); // remove from DB
    console.log("Added: ", difference.added.map(x => x.name)); // do a hard reload
    console.log("Contents modified: ", difference.modified.map(x => x[0].name)); // add logic to handle this

    difference.modified.forEach(pair => {
        const difference2 = diff(pair[0], pair[1]);
        
        console.log('----');
        console.log(`FOLDER - ${pair[0].name}:`);
        console.log("Deleted: ", difference2.deleted.map(x => x.name)); // if poster deleted => refetch. If season deleted => remove from DB
        console.log("Added: ", difference2.added.map(x => x.name)); // if folder added => parse season, extract thumbs & add to db. if file added => check if file video then accumulate them into a season/seasons, else purge
        console.log("Contents modified: ", difference2.modified.map(x => x[0].name)); // add logic to handle episode removal/addition


        // Deleted: if video file => remove Episode from database, if thumbnails folder then regenerate thumbnails for each episode
        // Added: if video added => parse Episode information from title, scrape thumbs, parse from imdb, else purge
        // Contents modified: add logic to handle each thumbnail removal

        // Deleted: regenerate thumbnail if possible
        // Added: purge
    });
}

function diff(cached: Tree, current: Tree) {
    const currentLevel1: Tree[] = current.children;
    const cachedLevel1: Tree[] = cached.children;
    
    let deletedSeries = cachedLevel1.filter(x => !currentLevel1.includesTree(x));
    let addedSeries = currentLevel1.filter(x => !cachedLevel1.includesTree(x));
    let modified = getModified(cachedLevel1, currentLevel1);

    return {
        deleted: deletedSeries,
        added: addedSeries,
        modified: modified
    };
}

function getModified(cached: Tree[], current: Tree[]) {
    return cached.intersect(current, (l, r) => l.name === r.name && l.hash() !== r.hash());
} 