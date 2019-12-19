import DatabaseManager from './test';

type SeriesType = {language: string, folder: string, title: string, seasons: number, description?: string, poster?: string};

class CreationManager extends DatabaseManager {

    constructor() {
        super();
    }

    async createSeries(series: SeriesType) {
        const result = await this.pool.query('INSERT INTO SERIES(LANGUAGE, FOLDER, TITLE, SEASONS, DESCRIPTION, POSTER) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
        [series.language, series.folder, series.title, series.seasons, series.description, series.poster]
        );

        return result;
    }

}

const cManager = new CreationManager();

cManager
    .createSeries({
        language: "en",
        folder: "hehe",
        title: "rick_and_morty",
        seasons: 2
    })
    .then(result => {
        console.log(result);
        console.log(result.rows);
    })
    .finally(() => {
        cManager.endConnection();
    });

export default CreationManager;
