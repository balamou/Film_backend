import { Router } from 'express';
import DatabaseFetcher from '../database/DatabaseFetcher';

const router = Router();

router.get("/video_url/:id/:type", (req, res, next) => {
    const id = parseInt(req.params.id);
    const type = req.params.type;
    
    if (type === 'movie') {
        getMovieInfo(id)
        .then(movie => res.json(movie))
        .catch(error => res.json({ error: error }));
    } else if (type === 'show') {
        getEpisodeInfo(id)
        .then(show => res.json(show))
        .catch(error => res.json({ error: error }));
    }
    
});

async function getMovieInfo(movieID: number) {
    const dbFetcher = new DatabaseFetcher();
    const movieInfo = await dbFetcher.getMovieInformation(movieID);

    dbFetcher.endConnection();

    return {
        id: movieInfo.id,
        title: movieInfo.title,
        videoURL: movieInfo.video_url,
        duration: movieInfo.duration
    };
}

async function getEpisodeInfo(episodeID: number) {
    const dbFetcher = new DatabaseFetcher();
    const episodeInfo = await dbFetcher.getEpisodeInformation(episodeID);

    dbFetcher.endConnection();

    return {
        id: episodeInfo.id,
        showTitle: episodeInfo.show_title,
        showId: episodeInfo.series_id,

        episodeTitle: episodeInfo.title,
        videoURL: episodeInfo.video_url,
        duration: episodeInfo.duration,
        seasonNumber: episodeInfo.season_number,
        episodeNumber: episodeInfo.episode_number
    };
}

export default router;