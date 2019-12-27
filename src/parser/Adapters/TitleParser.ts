export interface TitleParser {
    parse(fileName: string): { season?: number, episode?: number };
    parseSeasonFrom(folderName: string): number | undefined;
}

import ptt from 'parse-torrent-title';
import Path from 'path';

export class TitleParserAdapter implements TitleParser {

    parse(fileName: string): { season?: number | undefined; episode?: number | undefined; } {
        fileName = this.removeExtension(fileName);
        
        const info = ptt.parse(fileName);
        let season = info.season;
        let episode = info.episode;
        
        // fallback regex
        if (!episode) {
            const result = fileName.match(/(Episode|episode|Ep|ep|E|e)\D*(\d+)/);
            if (result)
                episode = this._parseInt(result[2]); // grab second group
        }

        return {
            season: season,
            episode: episode
        };
    }

    parseSeasonFrom(folderName: string): number | undefined {
        const allNumbers = folderName.replace(/\D+/g, '');
        const seasonNumber = this._parseInt(allNumbers);

        return seasonNumber;
    }

    private removeExtension(fileName: string) {
        return Path.parse(fileName).name;
    }

    /**
     * Attempts to convert a string `s` into a number. 
     * Returns undefined if not convertible.
    */
    private _parseInt(s: string): number | undefined {
        const result = parseInt(s);

        if (isNaN(result)) {
            return undefined;
        }

        return result;
    }
}