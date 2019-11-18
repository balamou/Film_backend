const router = require("express").Router();

router.get("/signup/:username", (req, res, next) => {
    const username = req.params.username;

    res.json({ userId: 2 });
});

module.exports = router;