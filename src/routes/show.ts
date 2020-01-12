import { Router } from "express";
import DatabaseFetcher from "../database/DatabaseFetcher";

const router = Router();

router.get("/show/:showId/:season", (req, res, next) => {
    const showId = parseInt(req.params.showId);
    const season = parseInt(req.params.season);

    execute(showId, season)
        .then(result => res.json(result))
        .catch(error => res.json({ error: error }));
});

// TODO:
// 1. Fetch series info
// -----2. Fetch last viewed episode
// 3. Fetch all episodes from the same season as last viewed
// -----4. if last viewed is nil then fetch season 1
// -----or whichever is the lowest available season
async function execute(showId: number, season: number) {
    const dbFetcher = new DatabaseFetcher();
    const series = await dbFetcher.getSeriesById(showId);
    const availableSeasons = await dbFetcher.getAvailableSeasons(showId);
    
    const seasonSelected = season > 0 ? season : availableSeasons[0];
    const episodes = await dbFetcher.getEpisodesFromSeason(showId, seasonSelected);

    await dbFetcher.endConnection();

    const seriesFix = {
        id: series.id,
        title: series.title,
        seasonSelected: seasonSelected,
        totalSeasons: series.seasons,
        description: series.description,
        posterURL: series.poster
    };
    const episodesFix = episodes.map(ep => {
        return {
            id: ep.id,
            episodeNumber: ep.episodeNumber!,
            seasonNumber: ep.seasonNumber!,
            videoURL: ep.videoURL,
            duration: ep.duration,
            thumbnailURL: ep.thumbnailURL,
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
