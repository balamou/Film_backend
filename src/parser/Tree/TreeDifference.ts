import Tree from "./Tree";
import './Array';

export class Difference {
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
        
        if (difference.modified.length === 0) return;
    
        console.log('  '.repeat(level), 'Modified: ');
    
        difference.modified.forEach(mod => {
            this.printAux(mod, level + 1);
        });
    }

    levelOrderTraversal(visit: (level: number, parent: Tree, deleted: Tree[], added: Tree[]) => void) {
        const queue = [this as Difference];
        let level = 0;
        while(queue.length > 0) {
            const size = queue.length;

            for (let i = 0; i < size; i++) {
                const diff = queue.shift()!;

                visit(level, diff.parent, diff.deleted, diff.added);

                diff.modified.forEach(mod => queue.push(mod));
            }

            level++;
        }
    }
}

export default class TreeDifference {

    static difference(before: Tree, after: Tree, depth: number = 3) {
        const difference = this.differentiatePair([[before, after]], depth);
    
        return difference[0];
    }
    
    private static differentiatePair(modified: [Tree, Tree][], depth: number) {
        return modified.map(modifiedPair => {
            const before = modifiedPair[0];
            const after = modifiedPair[1];
            const difference = this.diff(before, after);
    
            let nestedModifications: Difference[] = [];
            if (depth > 0)
                nestedModifications = this.differentiatePair(difference.modified, depth - 1);
            
            return new Difference(before, difference.deleted, difference.added, nestedModifications);
        });
    }
    
    private static diff(before: Tree, after: Tree) {
        const beforeChildren = before.children;
        const afterChildren = after.children;
        
        return {
            deleted: beforeChildren.butNotIn(afterChildren, (l, r) => l.name === r.name),
            added: afterChildren.butNotIn(beforeChildren, (l, r) => l.name === r.name),
            modified: beforeChildren.intersect(afterChildren, (l, r) => l.name === r.name && l.hash() !== r.hash())
        };
    }

}