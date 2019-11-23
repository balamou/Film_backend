const omdb = require('./omdb');
const SeriesModel = require('../model/series');

const folderOrginizer = (change, path) => {
    console.log(`${change} happened to ${path}`);
    const pathData = parsePath(path);
    if (!pathData) return;

    if (pathData.type === 'shows') {
        parseSeries(pathData.name, pathData);
    } else if (pathData.type === 'movies') {
        parseMovie(pathData.name);
    }
};

const parseSeries = async (seriesName, pathData) => {
    const series = await omdb.fetchSeries(seriesName);

    if (series.Error != null) { // TODO: handle not found series
        console.log(`Did not find a show named ${seriesName}`);
        // ask if user wants to abort => move to rejected folder
        // ask if user wants to rename
        // ask if user wants to add stale data (i.e. no information about a series, but still added)
        return;
    }

    console.log(series);
    const seriesData = {
        language: pathData.language,
        folder: pathData.path,
        title: series.Title,
        desc: series.Plot.substring(0, 250),
        poster: series.Poster,
        seasons: series.totalSeasons
    };

    SeriesModel.create(seriesData);

    for (let season = 1; season <= series.totalSeasons; season++) {
        try {
            const seasonData = await omdb.fetchSeason(seriesName, season);
            console.log(`SEASON ${season}`);

            console.log(typeof seasonData.Episodes);
            const episodeList = seasonData.Episodes.map(element => parseInt(element.Episode));
            episodeList.sort(function (a, b) { return a - b });
            console.log(episodeList);

            await episodeList.map(async episodeNumber => {
                const episodeData = await omdb.fetchEpisode(seriesName, season, episodeNumber);

                console.log(`S${season} E${episodeNumber} ${episodeData.Plot}`);
                console.log();
            });
        } catch (err) {
            console.log(err);
        }
        // console.log(seasonData);
    }
};

const parseMovie = movieName => {
    console.log('parse movie');
};

const parsePath = path => {
    const pathComponents = path.split('/'); // example: [ 'public', 'en', 'shows', 'rick_and_morty' ]
    console.log(pathComponents);

    const language = pathComponents[1];
    const type = pathComponents[2];

    if (pathComponents.length < 4) { console.log('Not the right directory'); return false; }
    if (!(language === 'en' || language === 'ru')) { console.log('No language directory found'); return false; }
    if (!(type === 'shows' || type === 'movies')) { console.log('Has to be in a `shows` or `movies` directory'); return false; }

    return {
        path: path,
        rootDirectory: pathComponents[0],
        language: pathComponents[1],
        type: pathComponents[2],
        name: pathComponents[3]
    };
};

module.exports = folderOrginizer;