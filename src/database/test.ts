import DatabaseManager from './DatabaseManager';
import CreationManager from './CreationManager';

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

test1();