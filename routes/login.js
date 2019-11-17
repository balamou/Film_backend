const router = require("express").Router();

router.get("/login/:username", (req, res, next) => {
    const username = req.params.username;

    res.send(`<b>${username}</b>`);
});

module.exports = router;