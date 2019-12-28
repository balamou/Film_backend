import FlattenFileTree from '../DirManager/FlattenFileTree';
import { DirTree, DirectoryTreeCreator } from '../Adapters/DirTreeCreator';
import { FSEditor } from '../Adapters/FSEditor';

import { TitleParserAdapter } from '../Adapters/TitleParser';
import { VirtualTreeBuilder } from './VirtualTree/VirtualTreeBuilder';
import { VirtualTreeParser } from './VirtualTree/VirtualTreeParser';

import { EnglishFetcher } from '../FilmScrapper/omdb';
import RussianFetcher from '../FilmScrapper/russian/RussianFetcher';
import VirtualTreeDBManager from './VirtualTree/VirtualTreeDBManager';
import FilePurger from '../DirManager/FilePurger';

export interface AbstractFactory {
    createDirTreeCreator(): DirectoryTreeCreator;
    createFlattenFileTree(): FlattenFileTree;
    createVirtualTreeBuilder(): VirtualTreeBuilder;
    createVirtualTreeParser(): VirtualTreeParser;
    createDatabaseManager(): VirtualTreeDBManager;
    createFilePurger(): FilePurger;
}

export default class OrginizerFactory implements AbstractFactory {
    
    createFilePurger(): FilePurger {
        return new FilePurger(new FSEditor());
    }

    createDirTreeCreator(): DirectoryTreeCreator {
        return new DirTree;
    }

    createFlattenFileTree(): FlattenFileTree {
        return new FlattenFileTree(new DirTree(), new FSEditor());
    }

    createVirtualTreeBuilder(): VirtualTreeBuilder {
        return new VirtualTreeBuilder(new TitleParserAdapter(), new FSEditor(), new DirTree());
    }

    createVirtualTreeParser(): VirtualTreeParser {
        return new VirtualTreeParser(new FSEditor(), new RussianFetcher());
    }

    createDatabaseManager(): VirtualTreeDBManager {
        return new VirtualTreeDBManager();
    }
}