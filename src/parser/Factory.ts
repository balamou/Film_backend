import { FlattenFileTree } from './FlattenFileTree';
import { DirTree } from './Adapters/DirTreeCreator';
import { FSEditor } from './Adapters/FSEditor';

export default class Factory {

    createFlattenFileTree(): FlattenFileTree {
        return new FlattenFileTree(new DirTree(), new FSEditor());
    }

}