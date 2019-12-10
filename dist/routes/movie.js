"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
router.get("/movie/:movieId/:userId", (req, res, next) => {
    const movieId = req.params.movieId;
    const userId = req.params.userId;
    const basePath = "http://192.168.72.59:3000";
    const movie = {
        id: 3,
        title: "lemeo",
        duration: 100,
        videoURL: basePath + "/en/shows/E03.mkv",
        description: "Some random description",
        poster: "https://cdn-www.bluestacks.com/bs-images/com.my_.ffs_.simulator.americandad_topbanner.jpg",
        stoppedAt: 40
    };
    res.json(movie);
});
exports.default = router;
