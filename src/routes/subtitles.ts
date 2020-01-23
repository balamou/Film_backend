import { Router } from 'express';
import DatabaseFetcher from '../database/DatabaseFetcher';
import { FSEditor } from '../parser/Adapters/FSEditor';

const parser = require('subtitles-parser-vtt');
const router = Router();

router.get("/subtitles/:seriesId/:seasonNumber/:episodeNumber", (req, res, next) => {
    const seriesId = parseInt(req.params.seriesId);
    const seasonNumber = parseInt(req.params.seasonNumber);
    const episodeNumber = parseInt(req.params.episodeNumber);

    const dbFetcher = new DatabaseFetcher();
    dbFetcher.getFolderFromSeriesId(seriesId)
    .then( ({folder}) => {
        const fsEditor = new FSEditor();
        const possibleSubtitleLocation = `${folder}/subtitles/S${seasonNumber}/E${episodeNumber}.srt`;
        console.log(possibleSubtitleLocation);

        if (fsEditor.doesFileExist(possibleSubtitleLocation)) {
            const subtitleData = fsEditor.readFile(possibleSubtitleLocation);
            
            const data = parser.fromSrt(subtitleData, true);
            res.json(data);
        } else {
            res.json({error: "No subtitles found"});
        }
    })
    .catch(error => res.json({error: error}))
    .finally(() => {
        dbFetcher.endConnection();
    });
});

export default router;