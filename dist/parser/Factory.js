"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlattenFileTree_1 = require("./FlattenFileTree");
const DirTreeCreator_1 = require("./Adapters/DirTreeCreator");
const FSEditor_1 = require("./Adapters/FSEditor");
class Factory {
    createFlattenFileTree() {
        return new FlattenFileTree_1.FlattenFileTree(new DirTreeCreator_1.DirTree(), new FSEditor_1.FSEditor());
    }
}
exports.default = Factory;
