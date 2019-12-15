"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlattenFileTree_1 = require("./FlattenFileTree");
const DirTreeCreator_1 = require("./Adapters/DirTreeCreator");
const FSEditor_1 = require("./Adapters/FSEditor");
const TitleParser_1 = require("./Adapters/TitleParser");
const VirtualTreeBuilder_1 = require("./VirtualTree/VirtualTreeBuilder");
class Factory {
    createFlattenFileTree() {
        return new FlattenFileTree_1.FlattenFileTree(new DirTreeCreator_1.DirTree(), new FSEditor_1.FSEditor());
    }
    createVirtualTreeBuilder(path) {
        return new VirtualTreeBuilder_1.VirtualTreeBuilder(path, new TitleParser_1.TitleParserAdapter(), new FSEditor_1.FSEditor());
    }
}
exports.default = Factory;
