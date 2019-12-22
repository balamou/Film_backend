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

export default function diffTrees(before: Tree, after: Tree, depth: number = 3) {
    const difference = differentiatePair([[before, after]], depth);

    return difference[0];
}

function differentiatePair(modified: [Tree, Tree][], depth: number) {
    return modified.map(modifiedPair => {
        const before = modifiedPair[0];
        const after = modifiedPair[1];
        const difference = diff(before, after);

        let nestedModifications: Difference[] = [];
        if (depth > 0)
            nestedModifications = differentiatePair(difference.modified, depth - 1);
        
        return new Difference(before, difference.deleted, difference.added, nestedModifications);
    });
}

function diff(before: Tree, after: Tree) {
    const beforeChildren: Tree[] = before.children;
    const afterChildren: Tree[] = after.children;
    
    return {
        deleted: beforeChildren.butNotIn(afterChildren, (l, r) => l.name === r.name),
        added: afterChildren.butNotIn(beforeChildren, (l, r) => l.name === r.name),
        modified: beforeChildren.intersect(afterChildren, (l, r) => l.name === r.name && l.hash() !== r.hash())
    };
}