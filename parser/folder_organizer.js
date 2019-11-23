const omdb = require('./omdb');

const folderOrginizer = (change, path) => {
    console.log(`${change} happened to ${path}`);
    const pathComponents = path.split('/'); // example: [ 'public', 'en', 'shows', 'rick_and_morty' ]
    console.log(pathComponents);
    
    if (!validatePath(pathComponents)) return;

    const rootDirectory = pathComponents[0];
    const language = pathComponents[1];
    const type = pathComponents[2];
    const name = pathComponents[3];

    omdb.fetchSeries(name)
    .then( data => {
        const series = JSON.parse(data);
        if (series.Error != null) { // TODO: handle not found series
            console.log(`Did not find a show named ${name}`); 
            // ask if user wants to abort => move to rejected folder
            // ask if user wants to rename 
            // ask if user wants to add stale data (i.e. no information about a series, but still added)
            return; 
        }

        console.log(series);
        console.log(series.Title);
        console.log(series.Plot);
        console.log(series.Poster);

    }).catch(err => {
        console.log(err);
    });
};

const validatePath = pathComponents => {
    const language = pathComponents[1];
    const type = pathComponents[2];

    if (pathComponents.length < 4) { console.log('Not the right directory'); return false; }
    if (!(language === 'en' || language === 'ru')) { console.log('No language directory found'); return false; }
    if (!(type === 'shows' || type === 'movies')) { console.log('Has to be in a `shows` or `movies` directory'); return false; }

    return true;
};

module.exports = folderOrginizer;