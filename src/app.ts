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

import series from './model/series';
import sequelize from './util/database';

import watcher from './parser/watcher';


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

const main = async () => {
    await sequelize.sync({ force: true, logging: false });
    await app.listen(PORT_NUMBER);
    watcher();
};

main();