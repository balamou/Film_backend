const express = require("express");
const app = express();

const login = require("./routes/login");
const signup = require("./routes/signup");
const shows = require("./routes/shows");
const movies = require("./routes/movies");
const watched = require("./routes/watched");
const show = require("./routes/show");
const movie = require("./routes/movie");
const episodes = require("./routes/episodes");

const series = require('./model/series');
const sequelize = require('./util/database');

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
    const watcher = require("./parser/watcher");
};

main();