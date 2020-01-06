import { Router } from 'express';
import DatabaseFetcher from '../database/DatabaseFetcher';

const router = Router();

router.get("/next_episode/:episodeId/:userId", (req, res, next) => {
    const episodeId = parseInt(req.params.episodeId);
    const userId = parseInt(req.params.userId);

    getNextEpisode(episodeId, userId)
    .then(film => res.json(film))
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
    } // TODO: return 'No more episodes'

    return {
        id: 3,
        URL: "en/shows/rick_and_morty/S1/E4.mp4",
        duration: 1930,
        type: "show",
        stoppedAt: 500,
        title: "Hello!"
    };
}

export default router;