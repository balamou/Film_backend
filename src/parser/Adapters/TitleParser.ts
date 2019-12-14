export interface TitleParser {
    parse(fileName: string): { season?: number, episode?: number };
    parseSeasonFrom(folderName: string): number | undefined;
}

import ptt from 'parse-torrent-title';

export class TitleParserAdapter implements TitleParser {

    parse(fileName: string): { season?: number | undefined; episode?: number | undefined; } {
        const info = ptt.parse(fileName);
        return {
            season: info.season,
            episode: info.episode
        };
    }

    parseSeasonFrom(folderName: string): number | undefined {
        const info = ptt.parse(folderName);

        return info.season;
    }
}