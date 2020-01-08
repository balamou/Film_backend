import { Router } from 'express';
import DatabaseFetcher from '../database/DatabaseFetcher';

const router = Router();

router.get("/episode_timestamps/:episodeId", (req, res, next) => {
    const episodeId = parseInt(req.params.episodeId);
    
    getEpisodeTimestamps(episodeId)
    .then(film => res.json(film))
    .catch(error => { 
        console.log(error);
        res.json({ error: error });});
});

async function getEpisodeTimestamps(episodeId: number) {
    const dbFetcher = new DatabaseFetcher();
    const episodeTimestamps = await dbFetcher.getEpisodeTimestamps(episodeId);

    dbFetcher.endConnection();
    
    // Expected JSON:
    // {"name":"Skip intro","action":{"type":"skip","to":30,"from":120}}
    // {"name":"Next episode","action":{"type":"nextEpisode","from":1230}}

    return episodeTimestamps.map(timestamp => {
        if (timestamp.to_time) {
            return {
                name: timestamp.name,
                action: {
                    type: timestamp.type,
                    from: timestamp.from_time,
                    to: timestamp.to_time
                }
            }
        }

        return {
            name: timestamp.name,
            action: {
                type: timestamp.type,
                from: timestamp.from_time
            }
        }
    });
}

export default router;