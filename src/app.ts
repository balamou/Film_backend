import express from 'express';
const app = express();

import login from './routes/login';
import signup from './routes/signup';
import shows from './routes/shows';
import movies from './routes/movies';
import watched from './routes/watched';
import show from './routes/show';
import movie from './routes/movie';
import episodes from './routes/episodes';

// import watcher from './parser/other/watcher';
// import dbsetup from './util/dbsetup';

const PORT_NUMBER = 3000;

app.use(express.static("./public"));

app.use(login);
app.use(signup);

app.use(shows);
app.use(movies);
app.use(watched);

app.use(show);
app.use(episodes);

app.use(movie);

app.get("/", (req, res, next) => {
    res.send("<p>REST API</p>");
});


async function main() {
    await app.listen(PORT_NUMBER);
    // await dbsetup();
    // watcher();
};

main();
