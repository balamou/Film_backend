import Tree from '../../Tree/Tree';

export class VirtualTree {
    private readonly tree: Season[] = []; // this should be a priority queue ordered by season number

    addEpisode = (seasonNumber: number, episode: Episode) => {
        let seasonNode = this.tree.find(node => node.seasonNum === seasonNumber); // could use a hash map

        if (!seasonNode) {
            seasonNode = new Season(seasonNumber);
            this.tree.push(seasonNode);
        }
        
        let episodeNode = seasonNode.episodes.find(node => node.episodeNum === episode.episodeNum) // could use a hash map

        if (episodeNode) throw new Error("Episode already added in the tree");

        seasonNode.episodes.push(episode);
    };

    /**
     * Iterates through each episode of every season
     * 
     * `O(mnlogn + mlogm)` where m = number of seasons, n = largest episode count in a season
     * Space `O(m + n)`
    */
    forEach = (apply: (season: Season, episode: Episode) => void) => {
        const sortedSeasons = this.tree.sort((a, b) => a.seasonNum - b.seasonNum); // O(n*logn) - this could be avoided using a PQ

        sortedSeasons.forEach(season => {
            const sortedEpisodes = season.episodes.sort((a, b) => a.episodeNum - b.episodeNum); // O(n*logn) - this could be avoided using a PQ

            sortedEpisodes.forEach(episode => apply(season, episode));
        });
    };

    async asyncForEach(apply: (season: Season, episode: Episode) => void) {
        const sortedSeasons = this.tree.sort((a, b) => a.seasonNum - b.seasonNum); // O(n*logn) - this could be avoided using a PQ

        for (let season of sortedSeasons) {
            const sortedEpisodes = season.episodes.sort((a, b) => a.episodeNum - b.episodeNum); // O(n*logn) - this could be avoided using a PQ

            for (let episode of sortedEpisodes) {
                await apply(season, episode);
            }
        }
    }
}

export class Season {
    readonly seasonNum: number;
    readonly episodes: Episode[] = []; // this should be a priority queue ordered by episode number
    path?: string;

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
}
