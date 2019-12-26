import FlattenFileTree from './DirManager/FlattenFileTree';
import { DirTree } from './Adapters/DirTreeCreator';
import { FSEditor } from './Adapters/FSEditor';

import { TitleParserAdapter } from './Adapters/TitleParser';
import { VirtualTreeBuilder } from './VirtualTree/VirtualTreeBuilder';
import { VirtualTreeParser } from './VirtualTree/VirtualTreeParser';

import { EnglishFetcher } from './FilmScrapper/omdb';
import RussianFetcher from './FilmScrapper/russian/RussianFetcher';

export default class Factory {

    createFlattenFileTree(): FlattenFileTree {
        return new FlattenFileTree(new DirTree(), new FSEditor());
    }

    createVirtualTreeBuilder(): VirtualTreeBuilder {
        return new VirtualTreeBuilder(new TitleParserAdapter(), new FSEditor(), new DirTree());
    }

    createVirtualTreeParser(): VirtualTreeParser {
        return new VirtualTreeParser(new FSEditor(), new RussianFetcher());
    }
}