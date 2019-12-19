import DatabaseManager from './DatabaseManager';
import CreationManager from './CreationManager';

async function test1() {
    const dbManager = new DatabaseManager();
    const result = await dbManager.setupDatabase()

    if (!result.rows) return;

    console.log(result.rows);
        
    dbManager.endConnection();
}

async function test2() {
    const cManager = new CreationManager();

    const series = await cManager.createSeries({
        language: "en",
        folder: "hehe",
        title: "rick_and_morty",
        seasons: 2
    });

    const seriesId = series.rows[0].id;
    if (!seriesId) return;

    const episode = await cManager.createEpisode({seriesId: seriesId, episodeNumber: 1, seasonNumber: 2, videoURL: "hehe", duration: 12});
    
    console.log(episode.rows);
    cManager.endConnection();
}

async function test3() {
    const cManager = new CreationManager();

    const users = await cManager.createUser({username: "michelbalamou"});

    console.log(users);

    cManager.endConnection();
}

test3();
