import { Router } from "express";
import User from "../model/user";

const router = Router();

router.get("/signup/:username", (req, res, next) => {
    const username = req.params.username;

    User.create({ username: username })
        .then(user => {
            res.json({ userId: user.id });
        })
        .catch(error => {
            if (error.name) res.json({ error: error.name });
            else res.json({ error: error });
        });
});

export default router;
