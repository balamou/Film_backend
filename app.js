const express = require("express");
const app = express();

const PORT_NUMBER = 3000;

app.get("/", (req, res, next) => {
    res.send("<p>REST API</p>");
});

app.listen(PORT_NUMBER);