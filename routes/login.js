const router = require("express").Router();

router.get("/login/:username", (req, res, next) => {
    const username = req.params.username;

    res.json({ userId: 1 });
});

module.exports = router;