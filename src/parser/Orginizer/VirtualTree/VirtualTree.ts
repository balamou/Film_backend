import Tree from '../../Tree/Tree';

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

    async asyncForEach(apply: (season: Season, episode: Episode) => void) {
        for (let season of this.tree) {
            for (let episode of season.episodes) {
                await apply(season, episode);
            }
        }
    }
}

export class Season {
    readonly seasonNum: number;
    episodes: Episode[] = [];
    path: string | undefined;

    constructor(seasonNum: number) {
        this.seasonNum = seasonNum;
    }
}

export class Episode {
    readonly episodeNum: number;
    readonly file: Tree;
    path: string;

    constructor(episodeNum: number, file: Tree) {
        this.episodeNum = episodeNum;
        this.file = file;
        this.path = file.path;
    }

    getNewEpisodeName = () => `E${this.episodeNum}${this.file.extension}`;
    getFullPath = () => this.file.path;
}
