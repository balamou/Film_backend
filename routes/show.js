const router = require("express").Router();

router.get("/show/:showId/:userId", (req, res, next) => {
    const showId = req.params.showId;
    const userId = req.params.userId;

    // TODO:
    // 1. Fetch series info
    // 2. Fetch last viewed episode
    // 3. Fetch all episodes from the same season as last viewed
    // 4. if last viewed is nil then fetch season 1
    // or whichever is the lowest available season

    const series = {
        title: "Rick and Morty",
        seasonSelected: 2,
        totalSeasons: 3,
        description: "Hehe",
        posterURL: "",
    };

    const episodes = generateEpisodes(10);
    
    res.json({ series: series, episodes: episodes});
});

const generateEpisodes = (number) => {
    const result = [];
    const SEASON_NUM = 14;

    for (let i = 0; i < number; i++) {
        const duration = numberBetween(1, 2) * 1000 + numberBetween(0, 9) * 100 + numberBetween(0, 9) * 10;

        result.push({
            id: i,
            episodeNumber: i + 1,
            seasonNumber: SEASON_NUM,
            videoURL: "/en/shows/E03.mkv",
            duration: duration,
            
            thumbnailURL: "",
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


module.exports = router;


