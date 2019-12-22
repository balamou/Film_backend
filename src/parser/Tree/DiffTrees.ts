import Tree from "./Tree";
import './Array';

class Difference {
    parent: Tree;
    deleted: Tree[]; 
    added: Tree[];
    modified: Difference[];

    constructor(parent: Tree, deleted: Tree[], added: Tree[], modified: Difference[]) {
        this.parent = parent;
        this.deleted = deleted;
        this.added = added;
        this.modified = modified;
    }

    print() {
        this.printAux(this);
    }

    private printAux(difference: Difference, level: number = 0) {
        console.log('  '.repeat(level), [ difference.parent.name ]);
        console.log('  '.repeat(level), 'Deleted: ', difference.deleted.map(x => x.name));
        console.log('  '.repeat(level), 'Added: ', difference.added.map(x => x.name));
        
        if (difference.modified.length == 0) return;
    
        console.log('  '.repeat(level), 'Modified: ');
    
        difference.modified.forEach(mod => {
            this.printAux(mod, level + 1);
        });
    }
}

export default function diffTrees(before: Tree, after: Tree): Difference {
    const difference = differentiatePair([[before, after]], 3);

    difference[0].print();

    return difference[0];
}

function differentiatePair(modified: [Tree, Tree][], depth: number) {
    return modified.map(pair => {
        const difference = diff(pair[0], pair[1]);

        let mod: Difference[] = [];
        if (depth > 0)
            mod = differentiatePair(difference.modified, depth - 1);
        
        return new Difference(pair[0], difference.deleted, difference.added,mod);
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