import { Router } from 'express';
import DatabaseFetcher from '../database/DatabaseFetcher';

const router = Router();

router.post("/posters", (req, res, next) => {
    const body = req.body as {type: string, id: number}[];
    console.log(body);
    const movieIDs = body.filter(item => item.type === 'movie').map(item => item.id);
    const showIDs = body.filter(item => item.type === 'show').map(item => item.id);

    getPosters(movieIDs, showIDs)
        .then(posters => res.json(posters))
        .catch(error => res.json({ error: error }));
});


async function getPosters(movieIDs: number[], showIDs: number[]) {
    let moviePosters = await getMoviePosters(movieIDs);
    let showPosters = await getShowPosters(showIDs);

    return [...moviePosters, ...showPosters];
}

async function getMoviePosters(movieIDs: number[]) {
    const dbFetcher = new DatabaseFetcher();
    const posters = await dbFetcher.getMoviePosters(movieIDs);

    dbFetcher.endConnection();

    return posters.map(movie => {
        return {
            type: "movie",
            id: movie.id,
            posterURL: movie.poster
        };
    });
}

async function getShowPosters(showIDs: number[]) {
    const dbFetcher = new DatabaseFetcher();
    const posters = await dbFetcher.getShowPosters(showIDs);

    dbFetcher.endConnection();

    return posters.map(show => {
        return {
            type: "show",
            id: show.id,
            posterURL: show.poster
        };
    });
}

export default router;