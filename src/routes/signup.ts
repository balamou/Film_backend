import { Router } from 'express';

const router = Router();

router.get("/signup/:username", (req, res, next) => {
    const username = req.params.username;

    res.json({ userId: 2 });
});

export default router;