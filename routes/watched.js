const router = require("express").Router();

router.get("/watched/:userid", (req, res, next) => {
    const userid = req.params.userid;
    const TYPE_MOVIE = "movie";
    const TYPE_SHOW = "show";

    const posters = ["https://cdn.flickeringmyth.com/wp-content/uploads/2019/02/vice.jpg",
    "https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_.jpg"];
        
    const watched = [
        { id: 3, posterURL: posters[0], stoppedAt: 0.8, label: "1h 3min", movieURL: "/en/shows/E03.mkv", type: TYPE_MOVIE},
        { id: 2, posterURL: posters[1], stoppedAt: 0.5, label: "S3:E4", movieURL: "/en/shows/E03.mkv", type: TYPE_SHOW}
    ];

    res.json(watched);
});

module.exports = router;