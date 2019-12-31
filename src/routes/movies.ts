import { Router } from 'express';
import DatabaseFetcher from '../database/DatabaseFetcher';

const router = Router();

router.get("/movies/:start/:quantity/:language", (req, res, next) => {
    const start = parseInt(req.params.start);
    const quantity = parseInt(req.params.quantity);
    const language = fixLanguage(req.params.language);

    getMovies(start, quantity, language)
    .then(moviesData => res.json(moviesData))
    .catch(error => res.json({ error: error }));
});

function fixLanguage(language: string) {
    if (language.toLowerCase() === 'english') return 'en';
    if (language.toLowerCase() === 'russian') return 'ru';

    return language.toLowerCase();
}

async function getMovies(start: number, quantity: number, language: string) {
    const dbFetcher = new DatabaseFetcher();
    const result = await dbFetcher.fetchMovies(start, quantity, language);

    await dbFetcher.endConnection();

    const moviesData = result.map(movie => {
        return {
            id: movie.id,
            posterURL: movie.poster
        };
    });

    return { movies: moviesData, isLast: true }; // TODO: enable pagination
}

export default router;
