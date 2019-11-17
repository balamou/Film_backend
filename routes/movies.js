const router = require("express").Router();

router.get("/movies/:start/:quantity/:language", (req, res, next) => {
    const start = req.params.start;
    const quantity = req.params.quantity;
    const language = req.params.language;

    res.send(`<b>${start}</b> <b>${quantity}</b> <b>${language}</b>`);
});

module.exports = router;