const router = require("express").Router();

router.get("/movie/:movieId/:userId", (req, res, next) => {
    const movieId = req.params.movieId;
    const userId = req.params.userId;

    const movie = {
        id: 3,
        title: "lemeo",
        duration: 100,
        videoURL: "/en/shows/E03.mkv",
        
        description: "Some random description",
        poster: "https://cdn-www.bluestacks.com/bs-images/com.my_.ffs_.simulator.americandad_topbanner.jpg",
        stoppedAt: 40
    };

    res.json(movie);
});

module.exports = router;