import { Router } from "express";
import CreationManager from "../database/CreationManager";

const router = Router();

router.get("/signup/:username", (req, res, next) => {
    const username = req.params.username;

    createUser(username)
    .then(userId => res.json({userId: userId}))
    .catch(error => {
        if (error.detail) res.json({ error: error.detail});
        else res.json({ error: error });
    });
});

async function createUser(username: string) {
    const cManager = new CreationManager();
    const user = await cManager.createUser({username: username});
    await cManager.endConnection();

    return user.id!;
}

export default router;
