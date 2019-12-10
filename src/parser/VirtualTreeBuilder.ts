import { VirtualTree, FileContent, Episode } from './VirtualTree';

interface TitleParser {
    parse(fileName: string): {season?: number, episode?: number};
    parseSeasonFrom(folderName: string): number;
}

type Folder = { name: string, children: FileContent[] };

export class VirtualTreeBuilder {
    private titleParser: TitleParser;
    readonly rejected: FileContent[] = [];
    readonly virtualTree: VirtualTree = new VirtualTree();

    constructor(titleParser: TitleParser) {
        this.titleParser = titleParser;
    }

    buildVirtualTree(files: FileContent[]) {
        files.forEach(file => {
            const info = this.titleParser.parse(file.name);

            if (info.season && info.episode) {
                try {
                    this.virtualTree.addEpisode(info.season, new Episode(info.episode, file));
                } catch (error) {
                    this.rejected.push(file);
                }
            } else {
                this.rejected.push(file);
            }
        });
    }

    buildVirtualTreeFromFolders(folders: Folder[]) {
        this.traverseFilesIn(folders, (folder, file) => {
            const seasonNumber = this.titleParser.parseSeasonFrom(folder.name);
            const episodeNumber = this.titleParser.parse(file.name).episode;

            if (episodeNumber) {
                try {
                    this.virtualTree.addEpisode(seasonNumber, new Episode(episodeNumber, file));
                } catch (error) {
                    this.rejected.push(file);
                }
            } else {
                this.rejected.push(file);
            }
        });
    }

    private traverseFilesIn(folders: Folder[], apply: (folder: Folder, file: FileContent) => void) {
        folders.forEach(folder => {
            folder.children.forEach(file => apply(folder, file));
        });
    }
}

