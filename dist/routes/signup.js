"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
router.get("/signup/:username", (req, res, next) => {
    const username = req.params.username;
    res.json({ userId: 2 });
});
exports.default = router;
