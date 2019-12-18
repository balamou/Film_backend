import { Router } from 'express';

const router = Router();

router.get("/login/:username", (req, res, next) => {
    const username = req.params.username;

    res.json({ userId: 1 });
});

export default router;