import { Router } from "express";
import DatabaseFetcher from "../database/DatabaseFetcher";

const router = Router();

router.get("/show/:showId/:userId", (req, res, next) => {
    const showId = parseInt(req.params.showId);
    const userId = parseInt(req.params.userId);

    execute(showId, userId)
        .then(result => res.json(result))
        .catch(error => res.json({ error: error }));
});

// TODO:
// 1. Fetch series info
// 2. Fetch last viewed episode
// 3. Fetch all episodes from the same season as last viewed
// 4. if last viewed is nil then fetch season 1
//    or whichever is the lowest available season
async function execute(showId: number, userId: number) {
    const dbFetcher = new DatabaseFetcher();
    const series = await dbFetcher.getSeriesById(showId);
    const lastWatchedEpisode = await dbFetcher.getLastWatchedEpisode(showId, userId);
    const episodes = await dbFetcher.getEpisodesFromSeriesIdWithStoppedAt(showId, lastWatchedEpisode.seasonNumber, userId);
    const availableSeasons = await dbFetcher.getAvailableSeasons(showId);

    await dbFetcher.endConnection();

    const seriesFix = {
        id: series.id,
        title: series.title,
        seasonSelected: lastWatchedEpisode.seasonNumber,
        totalSeasons: series.seasons,
        description: series.description,
        posterURL: series.poster?.replace(/public\//, ""),
        lastWatchedEpisode: lastWatchedEpisode
    };
    const episodesFix = episodes.map(ep => {
        return {
            id: ep.id,
            episodeNumber: ep.episodeNumber!,
            seasonNumber: ep.seasonNumber!,
            videoURL: ep.videoURL?.replace(/public\//, ""),
            duration: ep.duration,

            thumbnailURL: ep.thumbnailURL?.replace(/public\//, ""),
            title: ep.title,
            plot: ep.plot,
            stoppedAt: ep.stoppedAt
        };
    });

    return {
        series: seriesFix,
        episodes: episodesFix,
        availableSeasons: availableSeasons
    };
}

export default router;
