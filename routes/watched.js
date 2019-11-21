const router = require("express").Router();

router.get("/watched/:userid", (req, res, next) => {
    const userid = req.params.userid;
    const TYPE_MOVIE = "movie";
    const TYPE_SHOW = "show";

    const posters = ["https://cdn.flickeringmyth.com/wp-content/uploads/2019/02/vice.jpg",
    "https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_.jpg"];
        
    const basePath = "http://192.168.72.59:3000";

    const watched = [
        { id: 3, duration: 100, stoppedAt: 80, label: "1h 3min", videoURL: basePath + "/en/shows/E03.mkv", type: TYPE_MOVIE, posterURL: posters[0]},
        { id: 2, duration: 100, stoppedAt: 80, label: "S3:E4", videoURL: basePath + "/en/shows/E02.mp4", type: TYPE_SHOW, showId: 2, posterURL: posters[1]}
    ];

    res.json(watched);
});

module.exports = router;