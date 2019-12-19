import DatabaseManager from './DatabaseManager';
import CreationManager from './CreationManager';
import DatabaseFetcher from './DatabaseFetcher';

async function test1() {
    const dbManager = new DatabaseManager();
    const result = await dbManager.setupDatabase()

    if (!result.rows) return;

    console.log(result.rows);
        
    await dbManager.endConnection();
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
    cManager.endConnection();
}

async function test5() {
    const dbFetcher = new DatabaseFetcher();

    const result = await dbFetcher.getLastWatchedEpisode(1, 1);
    const result2 = await dbFetcher.getLastWatchedEpisode(1, 2);

    console.log(result);
    console.log(result2);

    dbFetcher.endConnection();
}


test5();