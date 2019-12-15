export interface TitleParser {
    parse(fileName: string): { season?: number, episode?: number };
    parseSeasonFrom(folderName: string): number | undefined;
}

import ptt from 'parse-torrent-title';

export class TitleParserAdapter implements TitleParser {

    parse(fileName: string): { season?: number | undefined; episode?: number | undefined; } {
        const info = ptt.parse(fileName);
        let season = info.season;
        let episode = info.episode;
        
        // fallback regex
        if (!episode) {
            const result = fileName.match(/(E|e)(\d+)/);
            if (result)
                episode = parseInt(result[2]); // grab second group
        }

        return {
            season: season,
            episode: episode
        };
    }

    parseSeasonFrom(folderName: string): number | undefined {
        const allNumbers = folderName.replace(/\D+/g, '');
        const seasonNumber = parseInt(allNumbers);

        return seasonNumber;
    }
}