import { Router } from 'express';
import DatabaseFetcher from '../database/DatabaseFetcher';

const router = Router();

router.get("/movie/:movieId/:userId", (req, res, next) => {
    const movieId = parseInt(req.params.movieId);
    const userId = parseInt(req.params.userId);

    getMovie(movieId, userId)
    .then(movie => res.json(movie))
    .catch(error => res.json({ error: error }));
});

async function getMovie(movieId: number, userId: number) {
    const dbFetcher = new DatabaseFetcher();
    const movie = await dbFetcher.getMovieById(movieId, userId);

    await dbFetcher.endConnection();

    return {
        id: movie.id,
        title: movie.title,
        duration: movie.duration,
        videoURL: movie.video_url,
        description: movie.description,
        poster: movie.poster,
        stoppedAt: movie.stopped_at
    };
}

export default router;