import DatabaseManager from './DatabaseManager';
import CreationManager from './CreationManager';
import DatabaseFetcher from './DatabaseFetcher';
import main from '../parser/main';
import { EnglishFetcher } from '../parser/FilmScrapper/omdb';
import RussianFetcher from '../parser/FilmScrapper/russian/RussianFetcher';

async function resetDatabase() {
    const dbManager = new DatabaseManager();
    const result = await dbManager.setupDatabase()
    await dbManager.endConnection();

    if (!result.rows) return;

    console.log(result.rows);        
}

async function test2() {
    const cManager = new CreationManager();

    const series = await cManager.createSeries({
        language: "en",
        folder: "hehe",
        title: "rick_and_morty",
        seasons: 2
    });

    const seriesId = series.id;
    if (!seriesId) return;

    const episode = await cManager.createEpisode({seriesId: seriesId, episodeNumber: 1, seasonNumber: 2, videoURL: "hehe", duration: 12});
    
    console.log(episode);
    await cManager.endConnection();
}

async function test3() {
    const cManager = new CreationManager();

    const users = await cManager.createUser({username: "michelbalamou"});

    console.log(users);

    await cManager.endConnection();
}

async function test4() {
    const cManager = new CreationManager();

    const episode = await cManager.createEpisode({
        seriesId: 1,
        seasonNumber: 1,
        episodeNumber: 2,
        videoURL: "hehe",
        duration: 12
    });
    await cManager.endConnection();
}

async function test5() {
    const dbFetcher = new DatabaseFetcher();

    const result = await dbFetcher.getLastWatchedEpisode(1, 1);
    const result2 = await dbFetcher.getLastWatchedEpisode(1, 2);

    console.log(result);
    console.log(result2);

    await dbFetcher.endConnection();
}

async function emptyEpisodesAndSeries() {
    const dbManager = new DatabaseManager();

    await dbManager.executeCustomQuery('DELETE FROM EPISODES;');
    await dbManager.executeCustomQuery('DELETE FROM SERIES;');
    await dbManager.endConnection();
}

async function completeReset() {
    // await resetDatabase();
    main();
}

function testEnglishFetcher() {
    const fetch = new EnglishFetcher();

    console.log(fetch["retrieveSeriesData"]('Rick and morty'));
    console.log(fetch.fetchEpisode('Rick and morty', 2, 3));

    console.log(_try(() => fetch.fetchEpisode('Friends', 1, 6)));

    console.log(tryMessage(() => fetch.fetchEpisode('Simpsons', 12, 4)));
    // console.log(tryMessage(() => fetch.fetchSeries('south park')));
}

function testRussianFetcher() {
    const fetch = new RussianFetcher();

    console.log(fetch.fetchEpisode('Rick and morty', 2, 3));
    console.log(_try(() => fetch.fetchEpisode('Friends', 1, 6)));
    console.log(tryMessage(() => fetch.fetchEpisode('Simpsons', 12, 4)));
    // console.log(tryMessage(() => fetch.fetchSeries('south park')));
}

testRussianFetcher();

function _try<T>(callback: () => T) {
    try {
        return callback();
    } catch {
        return undefined;
    }
}

function tryMessage<T>(callback: () => T) {
    try {
        return callback();
    } catch (error) {
        return (error as Error).message;
    }
}