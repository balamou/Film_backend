import { DirTree } from '../Adapters/DirTreeCreator';
import { FSEditor } from '../Adapters/FSEditor';
import FilePurger from '../Orginizer/DirManager/FilePurger';
import ffmpeg from '../Adapters/ffmpeg';

import DatabaseManager from '../../database/DatabaseManager';
import { EnglishMovieFetcherPrompt } from './english_fetcher';
import { MovieFetcherProtocol } from './FetcherProtocol';
import RussianFetcherPrompt from './russian_fetcher/russian_fetcher';

export default class MovieOrginizerFactory {
    createFSEditor = () => new FSEditor();
    createDirTree = () => new DirTree();
    createVideoProcessor = () => new ffmpeg();
    createFilePurger = () => new FilePurger(new FSEditor());
    createDBManager = () => new DatabaseManager();
    createFetcher = (language: string): MovieFetcherProtocol => {
        // if (language === 'ru') return new RussianFetcherPrompt(); FIX
        if (language === 'en') return new EnglishMovieFetcherPrompt();
        return new EnglishMovieFetcherPrompt();
    };
}
