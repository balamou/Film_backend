import { Router } from 'express';
import Episode from '../model/episode';

const router = Router();

router.get("/episodes/:showId/:userId/:season", (req, res, next) => {
    const showId = parseInt(req.params.showId);
    const userId = parseInt(req.params.userId);
    const season = parseInt(req.params.season);

    Episode.findAll({
        where: { seriesId: showId, seasonNumber: season },
        order: [['episodeNumber', 'ASC']]
    }
    ).then(episodes => {
        const mapped = episodes.map( ep => {
            return {
                id: ep.id,
                episodeNumber: ep.episodeNumber,
                seasonNumber: ep.seasonNumber,
                videoURL: ep.videoURL.replace(/public\//, ''),
                duration: ep.duration,
    
                thumbnailURL: ep.thumbnailURL?.replace(/public\//, ''),
                title: ep.title,
                plot: ep.plot,
                stoppedAt: numberBetween(0, ep.duration) // TODO: get stopped at
            };
        });

        res.json(mapped);
    }).catch(error => {
        res.json({error: error });
    });
});

const generateEpisodes = () => {
    const number = numberBetween(1, 9);
    const result = [];
    const SEASON_NUM = 14;

    const basePath = "http://192.168.72.59:3000";

    for (let i = 0; i < number; i++) {
        const duration = numberBetween(1, 2) * 1000 + numberBetween(0, 9) * 100 + numberBetween(0, 9) * 10;
        const thumbnailURL = (Math.random() > 0.9) ? "https://cdn.flickeringmyth.com/wp-content/uploads/2019/02/vice.jpg" : "";

        result.push({
            id: i,
            episodeNumber: i + 1,
            seasonNumber: SEASON_NUM,
            videoURL: basePath + "/en/shows/E03.mkv",
            duration: duration,

            thumbnailURL: thumbnailURL,
            title: "",
            plot: "More random descriptions please. ".repeat(numberBetween(0, 6)),
            stoppedAt: numberBetween(0, duration)
        });
    }

    return result;
};

const numberBetween = (start: number, end: number) => {
    return Math.floor((Math.random() * end) + start);
};

export default router;