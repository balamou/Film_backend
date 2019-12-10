"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
router.get("/show/:showId/:userId", (req, res, next) => {
    const showId = req.params.showId;
    const userId = req.params.userId;
    // TODO:
    // 1. Fetch series info
    // 2. Fetch last viewed episode
    // 3. Fetch all episodes from the same season as last viewed
    // 4. if last viewed is nil then fetch season 1
    //    or whichever is the lowest available season
    const episodes = generateEpisodes(numberBetween(5, 10));
    const series = {
        id: 1,
        title: "Rick and Morty",
        seasonSelected: 2,
        totalSeasons: 3,
        description: "Hehe",
        posterURL: "",
        lastWatchedEpisode: episodes[1]
    };
    res.json({ series: series, episodes: episodes });
});
const generateEpisodes = (number) => {
    const result = [];
    const SEASON_NUM = 14;
    for (let i = 0; i < number; i++) {
        const duration = numberBetween(1, 2) * 1000 + numberBetween(0, 9) * 100 + numberBetween(0, 9) * 10;
        const basePath = "http://192.168.72.59:3000";
        const evenImage = "https://images-na.ssl-images-amazon.com/images/I/71dXHCpZAXL._SL1051_.jpg";
        const oddImage = "https://images-na.ssl-images-amazon.com/images/I/81e36u8GzsL._SL1500_.jpg";
        result.push({
            id: i,
            episodeNumber: i + 1,
            seasonNumber: SEASON_NUM,
            videoURL: basePath + ((i % 2 == 0) ? "/en/shows/E03.mkv" : "/en/shows/E02.mp4"),
            duration: duration,
            thumbnailURL: ((i % 2 == 0) ? evenImage : oddImage),
            title: "",
            plot: "This is some interesting description. ".repeat(numberBetween(0, 6)),
            stoppedAt: numberBetween(0, duration)
        });
    }
    return result;
};
const numberBetween = (start, end) => {
    return Math.floor((Math.random() * end) + start);
};
exports.default = router;
