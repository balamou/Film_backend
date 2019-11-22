const http = require('http');

const httpGet = url => {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            res.setEncoding('utf8');
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(body));
        }).on('error', reject);
    });
};

const API_KEY = `b2141cec`;
const seriesEndPoint = seriesName => `http://www.omdbapi.com/?apikey=${API_KEY}&t=${seriesName}&plot=full&type=series`;
const seasonEndPoint = (seriesName, season) => `http://www.omdbapi.com/?apikey=${API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}`;
const episodeEndPoint = (seriesName, season, episode) => `http://www.omdbapi.com/?apikey=${API_KEY}&t=${seriesName}&plot=full&type=series&Season=${season}&Episode=${episode}`;
const movieEndPoint = movieName => `http://www.omdbapi.com/?apikey=${API_KEY}&t=${movieName}&plot=full&type=movie`;

const folderOrginizer = (change, path) => {
    console.log(`${change} happened to ${path}`);
    const pathComponents = path.split('/'); // example: [ 'public', 'en', 'shows', 'rick_and_morty' ]
    console.log(pathComponents);

    const rootDirectory = pathComponents[0];
    const language = pathComponents[1];
    const type = pathComponents[2];
    const name = pathComponents[3];

    if (pathComponents.length < 4) { console.log('Not the right directory'); return; }
    if (!(language === 'en' || language === 'ru')) { console.log('No language directory found'); return; }
    if (!(type === 'shows' || type === 'movies')) { console.log('Has to be in a `shows` or `movies` directory'); return; }

    const request = httpGet(seriesEndPoint(name));
    request.then( data => {
        console.log(data);
        const series = JSON.parse(data);
    }).catch(err => {
        console.log(err);
    });
};

module.exports = folderOrginizer;