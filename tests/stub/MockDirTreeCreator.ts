import { DirectoryTreeCreator } from '../../src/parser/Adapters/DirTreeCreator';
import Tree from "../../src/parser/Tree/Tree";

export default class MockDirTreeCreator implements DirectoryTreeCreator {
    
    treeFrom(path: string, exclude?: RegExp): Tree {
        throw new Error();
    }

}