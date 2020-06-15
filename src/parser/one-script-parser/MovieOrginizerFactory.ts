import { DirTree } from '../Adapters/DirTreeCreator';
import { FSEditor } from '../Adapters/FSEditor';
import FilePurger from '../Orginizer/DirManager/FilePurger';
import ffmpeg from '../Adapters/ffmpeg';

import RussianFetcher from '../FilmScrapper/russian/RussianFetcher';
import { EnglishFetcher } from '../FilmScrapper/omdb';
import Fetcher from '../FilmScrapper/fetcher';
import DatabaseManager from '../../database/DatabaseManager';

export default class MovieOrginizerFactory {
    createFSEditor = () => new FSEditor();
    createDirTree = () => new DirTree();
    createVideoProcessor = () => new ffmpeg();
    createFilePurger = () => new FilePurger(new FSEditor());
    createDBManager = () => new DatabaseManager();
    createFetcher = (language: string): Fetcher => {
        if (language === 'ru') return new RussianFetcher();
        if (language === 'en') return new EnglishFetcher();
        return new EnglishFetcher();
    };
}
