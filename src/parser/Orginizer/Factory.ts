import FlattenFileTree from './DirManager/FlattenFileTree';
import { DirTree, DirectoryTreeCreator } from '../Adapters/DirTreeCreator';
import { FSEditor } from '../Adapters/FSEditor';

import { TitleParserAdapter } from '../Adapters/TitleParser';
import { VirtualTreeBuilder } from './VirtualTree/VirtualTreeBuilder';
import { VirtualTreeParser } from './VirtualTree/VirtualTreeParser';

import { EnglishFetcher } from '../FilmScrapper/omdb';
import RussianFetcher from '../FilmScrapper/russian/RussianFetcher';
import VirtualTreeDBManager from './VirtualTree/VirtualTreeDBManager';
import FilePurger from './DirManager/FilePurger';
import Fetcher from '../FilmScrapper/fetcher';

export interface AbstractFactory {
    createDirTreeCreator(): DirectoryTreeCreator;
    createFlattenFileTree(): FlattenFileTree;
    createVirtualTreeBuilder(): VirtualTreeBuilder;
    createVirtualTreeParser(language: string): VirtualTreeParser;
    createDatabaseManager(language: string): VirtualTreeDBManager;
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

    createVirtualTreeParser(language: string): VirtualTreeParser {
        let fetcher: Fetcher = new EnglishFetcher();
        switch(language) {
            case 'en':
                fetcher = new EnglishFetcher();
                break;
            case 'ru':
                fetcher = new RussianFetcher();
                break;
        }

        return new VirtualTreeParser(new FSEditor(), fetcher);
    }

    createDatabaseManager(language: string): VirtualTreeDBManager {
        return new VirtualTreeDBManager(language);
    }
}