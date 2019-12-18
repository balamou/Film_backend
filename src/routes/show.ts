import { Router } from 'express';
import Series from '../model/series';
import Episode from '../model/episode';

const router = Router();

router.get("/show/:showId/:userId", (req, res, next) => {
    const showId = parseInt(req.params.showId);
    const userId = parseInt(req.params.userId);

    // TODO:
    // 1. Fetch series info
    // 2. Fetch last viewed episode
    // 3. Fetch all episodes from the same season as last viewed
    // 4. if last viewed is nil then fetch season 1
    //    or whichever is the lowest available season

    Series.findByPk(showId, {
        include: [{model: Episode, as: 'episodes', where: {seasonNumber: 1} }],
        order: [[{model: Episode, as: 'episodes'}, 'episodeNumber','ASC']],
        rejectOnEmpty: true, // Specifying true here removes `null` from the return type!
        logging: false
    }).then( series => {
        const episodes = series.episodes?.map(ep => {
            return {
                id: ep.id,
                episodeNumber: ep.episodeNumber,
                seasonNumber: ep.seasonNumber,
                videoURL: ep.videoURL?.replace(/public\//, ''),
                duration: ep.duration,
                
                thumbnailURL: ep.thumbnailURL?.replace(/public\//, ''),
                title: ep.title,
                plot: ep.plot,
                stoppedAt: numberBetween(0, ep.duration) // TODO: get actual stopped at
            };
        });

        const fix = {
            id: series.id,
            title: series.title,
            seasonSelected: 2, // TODO: get last viewed season
            totalSeasons: series.seasons,
            description: series.desc,
            posterURL: series.poster?.replace(/public\//, ''),
            lastWatchedEpisode: episodes![0] // TODO: get last viewed
        };

        res.json({series: fix, episodes: episodes});
    }).catch( error => {
        res.json({error: error});
    });
});

const generateEpisodes = (number: number) => {
    const result = [];
    const SEASON_NUM = 14;

    for (let i = 0; i < number; i++) {
        const duration = numberBetween(1, 2) * 1000 + numberBetween(0, 9) * 100 + numberBetween(0, 9) * 10;

        const basePath = "http://192.168.72.59:3000";

        const evenImage = "https://images-na.ssl-images-amazon.com/images/I/71dXHCpZAXL._SL1051_.jpg";
        const oddImage = "https://images-na.ssl-images-amazon.com/images/I/81e36u8GzsL._SL1500_.jpg";

        result.push({
            id: i,
            episodeNumber: i + 1,
            seasonNumber: SEASON_NUM,
            videoURL: basePath + ((i % 2 == 0) ? "/en/shows/E03.mkv" : "/en/shows/E02.mp4"),
            duration: duration,
            
            thumbnailURL: ((i % 2 == 0) ? evenImage : oddImage),
            title: "",
            plot: "This is some interesting description. ".repeat(numberBetween(0, 6)),
            stoppedAt: numberBetween(0, duration)
        });
    }
    
    return result;
};

const numberBetween = (start: number, end: number) => {
    return Math.floor((Math.random() * end) + start);
};

export default router;


