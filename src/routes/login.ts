import { Router } from "express";
import User from "../model/user";

const router = Router();

router.get("/login/:username", (req, res, next) => {
    const username = req.params.username;

    User.findOne({ where: { username: username } })
        .then(user => {
            if (user) {
                res.json({ userId: user.id });
            } else {
                // user does not exist
                res.json({ error: "Username does not exist" });
            }
        })
        .catch(error => {
            res.json({ error: error });
        });
});

export default router;
