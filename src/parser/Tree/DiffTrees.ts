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

function instructions() {
    // d[SERIES] remove from DB
    // a[SERIES] do a hard reload (Assumption -> all files are purged before this method executes)
    // m[see below] add logic to handle this

        // d[SEASON, POSTER] if poster deleted => refetch. If season deleted => remove from DB
        // a[FOLDER(season/purge), FILE(video/purge)] if folder added => parse season, extract thumbs & add to db. if file added => check if file video then accumulate them into a season/seasons, else purge
        // m[SEASON see below] add logic to handle episode removal/addition

            // d[EPISODE, THUMBNAILS]: if video file => remove Episode from database, if thumbnails folder then regenerate thumbnails for each episode
            // a[FOLDER(purge), FILE(video, purge)]: if video added => parse Episode information from title, scrape thumbs, parse from imdb, else purge
            // m[THUMBAILS see below] Contents modified: add logic to handle each thumbnail removal

                // Deleted: regenerate thumbnail if possible
                // Added: purge
}

type Difference = {parent: Tree, deleted: Tree[], added: Tree[], modified: Difference[]};

export default function diffTrees(before: Tree, after: Tree): Difference {
    const difference = differentiatePair([[before, after]], 3);

    printDifference(difference[0]);

    return difference[0];
}

function printDifference(difference: Difference, level: number = 0) {
    console.log('  '.repeat(level), [ difference.parent.name ]);
    console.log('  '.repeat(level), 'Deleted: ', difference.deleted.map(x => x.name));
    console.log('  '.repeat(level), 'Added: ', difference.added.map(x => x.name));
    
    if (difference.modified.length == 0) return;
    
    console.log('  '.repeat(level), 'Modified: ');

    difference.modified.forEach(mod => {
        printDifference(mod, ++level);
    });
}

function differentiatePair(modified: [Tree, Tree][], depth: number) {
    return modified.map(pair => {
        const difference = diff(pair[0], pair[1]);

        let mod: Difference[] = [];
        if (depth > 0)
            mod = differentiatePair(difference.modified, --depth);
        
        return {
            parent: pair[0],
            deleted: difference.deleted,
            added: difference.added,
            modified: mod
        } as Difference;
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