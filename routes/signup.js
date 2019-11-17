const router = require("express").Router();

router.get("/signup/:username", (req, res, next) => {
    const username = req.params.username;

    res.send(`<b>${username}</b>`);
});

module.exports = router;