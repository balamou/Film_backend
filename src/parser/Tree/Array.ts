declare global {
    interface Array<T> {
        doesInclude<T>(this: T[], rhs: T, comparator: (lhs: T, rhs: T) => boolean): boolean;
        intersect<T>(this: T[], rhs: T[], comparator: (lhs: T, rhs: T) => boolean): [T, T][];
        butNotIn<T>(this: T[], rhs: T[], comparator: (lhs: T, rhs: T) => boolean): T[];
            
        flatMap<T, U>(this: T[], callbackfn: (value: T) => U[]): U[] 
    }
}

function doesInclude<T>(this: T[], rhs: T, comparator: (lhs: T, rhs: T) => boolean): boolean {
    for (let obj of this) {
        if (comparator(obj, rhs))
            return true;
    }

    return false;
}

// Returns an array of pairs where each pair contains a left object from lhs array 
// and a right object from rhs array. Each pari evaluates to true with the equality 
// predicate `comparator(left_obj, right_obj)`.
//
// Runs in O(n^2) where n is the size of the largest array between `lhs` and `rhs`.
// Note: the runtime can be improved to O(n*log(n)) by sorting each array first.
function intersect<T>(this: T[], rhs: T[], comparator: (lhs: T, rhs: T) => boolean) {
    const result: [T, T][] = [];

    this.forEach(value => {
        const matchingObject = rhs.find(x => comparator(value, x));

        if (!matchingObject) return;

        result.push([value, matchingObject]);
    });

    return result;
}

// Returns all objects in `this` that are not found in `rhs`
function butNotIn<T>(this: T[], rhs: T[], comparator: (lhs: T, rhs: T) => boolean): T[] {
    return this.filter(obj => !rhs.doesInclude(obj, comparator));
}

function flatMap<T, U>(this: T[], callbackfn: (value: T) => U[]): U[] {
    return Array.prototype.concat(...this.map(callbackfn));
}

Array.prototype.doesInclude = doesInclude;
Array.prototype.intersect = intersect;
Array.prototype.butNotIn = butNotIn;
Array.prototype.flatMap = flatMap;

export {};