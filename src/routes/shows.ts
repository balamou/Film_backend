import { Router } from "express";
import DatabaseFetcher from '../database/DatabaseFetcher';

const router = Router();

router.get("/shows/:start/:quantity/:lang", (req, res, next) => {
  const start = parseInt(req.params.start);
  const quantity = parseInt(req.params.quantity);
  const language = fixLanguage(req.params.lang);

  getSeries(start, quantity, language)
      .then(showData => res.json(showData))
      .catch(error => res.json({ error: error }));
});

function fixLanguage(language: string) {
  if (language.toLowerCase() === 'english') return 'en';
  if (language.toLowerCase() === 'russian') return 'ru';

  return language.toLowerCase();
}

async function getSeries(start: number, quantity: number, language: string) {
    const dbFetcher = new DatabaseFetcher();
    const result = await dbFetcher.fetchSeries(start, quantity, language);

    await dbFetcher.endConnection();

    const showsData = result.map(show => {
        return {
            id: show.id!,
            posterURL: show.poster?.replace(/public\//, "")
        };
    });

    return { showsData: showsData, isLast: true }; // TODO: enable pagination
}

export default router;
