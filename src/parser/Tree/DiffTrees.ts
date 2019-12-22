import Tree from "./Tree";
import './Array';

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
        printDifference(mod, level + 1);
    });
}

function differentiatePair(modified: [Tree, Tree][], depth: number) {
    return modified.map(pair => {
        const difference = diff(pair[0], pair[1]);

        let mod: Difference[] = [];
        if (depth > 0)
            mod = differentiatePair(difference.modified, depth - 1);
        
        return {
            parent: pair[0],
            deleted: difference.deleted,
            added: difference.added,
            modified: mod
        } as Difference;
    });
}

function diff(before: Tree, after: Tree) {
    const beforeChildren: Tree[] = before.children;
    const afterChildren: Tree[] = after.children;
    
    let deletedSeries = beforeChildren.butNotIn(afterChildren, (l, r) => l.name === r.name);
    let addedSeries = afterChildren.butNotIn(beforeChildren, (l, r) => l.name === r.name);
    let modified = getModified(beforeChildren, afterChildren);

    return {
        deleted: deletedSeries,
        added: addedSeries,
        modified: modified
    };
}

function getModified(cached: Tree[], current: Tree[]) {
    return cached.intersect(current, (l, r) => l.name === r.name && l.hash() !== r.hash());
} 