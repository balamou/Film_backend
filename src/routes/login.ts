import { Router } from "express";
import DatabaseFetcher from "../database/DatabaseFetcher";

const router = Router();

router.get("/login/:username", (req, res, next) => {
    const username = req.params.username;

    getUser(username)
    .then(userId => res.json({ userId: userId }))
    .catch(error => {
        if (error.message) 
            res.json({ error: error.message });
        else if (error.detail) 
            res.json({ error: error.detail });
        else
            res.json({ error: error });
    });
});

async function getUser(username: string) {
    const dbFetcher = new DatabaseFetcher();
    const user = await dbFetcher.getUser(username);
    await dbFetcher.endConnection();

    return user.id!;
} 

export default router;
