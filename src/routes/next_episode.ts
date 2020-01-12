import { Router } from 'express';
import DatabaseFetcher from '../database/DatabaseFetcher';

const router = Router();

router.get("/next_episode/:episodeId/:userId", (req, res, next) => {
    const episodeId = parseInt(req.params.episodeId);
    const userId = parseInt(req.params.userId);

    getNextEpisode(episodeId, userId)
    .then(film => {
        if (film) {
            res.json({isLastEpisode: false, film: film});
        } else {
            res.json({isLastEpisode: true});
        }
    })
    .catch(error => { 
        console.log(error);
        res.json({ error: error });});
});

async function getNextEpisode(episodeId: number, userId: number) {
    const dbFetcher = new DatabaseFetcher();
    const film = await dbFetcher.getNextEpisodeFrom(episodeId, userId);

    dbFetcher.endConnection();

    if (film) {
        return {
            id: film.id,
            URL: film.video_url,
            duration: film.duration,
            type: "show",
            stoppedAt: film.stopped_at,
            title: `S${film.season_number}:E${film.episode_number} \"${film.title}\"`
        }
    } 
}

export default router;