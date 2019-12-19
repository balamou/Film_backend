import { Router } from 'express';
import DatabaseFetcher from '../database/DatabaseFetcher';

const router = Router();

router.get("/episodes/:seriesId/:userId/:season", (req, res, next) => {
    const seriesId = parseInt(req.params.seriesId);
    const userId = parseInt(req.params.userId);
    const season = parseInt(req.params.season);

    execute(seriesId, userId, season)
    .then(episodes => res.json(episodes))
    .catch(error => res.json({error: error}));
});

async function execute(seriesId: number, userId: number, season: number) {
    const dbFetcher = new DatabaseFetcher();

    const episodes = await dbFetcher.getEpisodesFromSeriesIdWithStoppedAt(seriesId, season, userId);

    return episodes.map( ep => {
        return {
            id: ep.id,
            episodeNumber: ep.episodeNumber,
            seasonNumber: ep.seasonNumber,
            videoURL: ep.videoURL.replace(/public\//, ''),
            duration: ep.duration,
            thumbnailURL: ep.thumbnailURL?.replace(/public\//, ''),
            title: ep.title,
            plot: ep.plot,
            stoppedAt: ep.stoppedAt
        };
    });
}

export default router;