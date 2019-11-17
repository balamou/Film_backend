const router = require("express").Router();

router.get("/watched/:userid", (req, res, next) => {
    const userid = req.params.userid;

    res.send(`<b>${userid}</b>`);
});

module.exports = router;