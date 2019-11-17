const express = require("express");
const app = express();

const login = require("./routes/login");
const signup = require("./routes/signup");
const shows = require("./routes/shows");
const movies = require("./routes/movies");
const watched = require("./routes/watched");

const PORT_NUMBER = 3000;

app.get("/", (req, res, next) => {
    res.send("<p>REST API</p>");
});

app.use(login);
app.use(signup);
app.use(shows);
app.use(movies);
app.use(watched);

app.listen(PORT_NUMBER);