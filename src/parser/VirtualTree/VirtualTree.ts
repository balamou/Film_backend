import Tree from '../Tree';

export class VirtualTree {
    tree: Season[] = [];

    addEpisode = (seasonNumber: number, episode: Episode) => {
        let seasonNode = this.tree.find(node => node.seasonNum === seasonNumber);

        if (!seasonNode) {
            seasonNode = new Season(seasonNumber);
            this.tree.push(seasonNode);
        }

        let episodeNode = seasonNode.episodes.find(node => node.episodeNum === episode.episodeNum)

        if (episodeNode) throw new Error("Episode already added in the tree");

        seasonNode.episodes.push(episode);
    };

    // Iterates through each episode of every season
    forEach = (apply: (season: Season, episode: Episode) => void) => {
        this.tree.forEach(season => {
            season.episodes.forEach(episode => apply(season, episode));
        });
    };
}

export class Season {
    readonly seasonNum: number;
    episodes: Episode[] = [];

    constructor(seasonNum: number) {
        this.seasonNum = seasonNum;
    }
}

// export type FileContent = { name: string, path: string, extension: string };

export class Episode {
    readonly episodeNum: number;
    readonly file: Tree;

    constructor(episodeNum: number, file: Tree) {
        this.episodeNum = episodeNum;
        this.file = file;
    }

    getNewEpisodeName = () => `E${this.episodeNum}${this.file.extension}`;
    getFullPath = () => this.file.path;
}
