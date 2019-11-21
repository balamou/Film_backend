const router = require("express").Router();

router.get("/episodes/:showId/:userId/:season", (req, res, next) => {
    const showId = req.params.showId;
    const userId = req.params.userId;
    const season = req.params.season;

    const episodes = generateEpisodes();
    res.json(episodes);
});

const generateEpisodes = () => {
    const number = numberBetween(1, 9);
    const result = [];
    const SEASON_NUM = 14;

    const basePath = "http://192.168.72.59:3000";

    for (let i = 0; i < number; i++) {
        const duration = numberBetween(1, 2) * 1000 + numberBetween(0, 9) * 100 + numberBetween(0, 9) * 10;
        const thumbnailURL = (Math.random() > 0.9) ? "https://cdn.flickeringmyth.com/wp-content/uploads/2019/02/vice.jpg" : "";

        result.push({
            id: i,
            episodeNumber: i + 1,
            seasonNumber: SEASON_NUM,
            videoURL: basePath + "/en/shows/E03.mkv",
            duration: duration,

            thumbnailURL: thumbnailURL,
            title: "",
            plot: "More random descriptions please. ".repeat(numberBetween(0, 6)),
            stoppedAt: numberBetween(0, duration)
        });
    }

    return result;
};

const numberBetween = (start, end) => {
    return Math.floor((Math.random() * end) + start);
};

module.exports = router;