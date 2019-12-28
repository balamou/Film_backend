import DatabaseManager from '../database/DatabaseManager';

async function resetDatabase() {
    const dbManager = new DatabaseManager();
    const result = await dbManager.setupDatabase()
    await dbManager.endConnection();

    if (!result.rows) return;

    console.log(result.rows);   
}

resetDatabase();