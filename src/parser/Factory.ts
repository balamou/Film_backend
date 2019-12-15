import { FlattenFileTree } from './FlattenFileTree';
import { DirTree } from './Adapters/DirTreeCreator';
import { FSEditor } from './Adapters/FSEditor';

import { TitleParserAdapter } from './Adapters/TitleParser';
import { VirtualTreeBuilder } from './VirtualTree/VirtualTreeBuilder';

export default class Factory {

    createFlattenFileTree(): FlattenFileTree {
        return new FlattenFileTree(new DirTree(), new FSEditor());
    }

    createVirtualTreeBuilder(path: string): VirtualTreeBuilder {
        return new VirtualTreeBuilder(path, new TitleParserAdapter(), new FSEditor());
    }
}