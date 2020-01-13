import { VirtualTreeBuilder } from './Orginizer/VirtualTree/VirtualTreeBuilder';
import Tree from './Tree/Tree';
import { Episode } from './Orginizer/VirtualTree/VirtualTree';


class VirtualTreeBuilderPrompt extends VirtualTreeBuilder {

    buildVirtualTreeFromFilesPrompt(files: Tree[], shouldContinue: (stage: string, example: string) => boolean) {
        let shouldKeepGoing: boolean | undefined = undefined;

        files.forEach(file => {
            const { season, episode } = this.titleParser.parse(file.name);

            if (shouldKeepGoing === false) return;
            
            if (season && episode) {
                if (shouldKeepGoing === undefined) {
                    shouldKeepGoing = shouldContinue('Parsing files', `'S${season}E${episode}' extracted from '${file.name}'`);
                    if (shouldKeepGoing === false) return;
                }

                try {
                    this.virtualTree.addEpisode(season, new Episode(episode, file));
                } catch (error) {
                    this.rejected.push(file);
                }
            } else {
                this.rejected.push(file);
            }
        });
    }

    buildVirtualTreeFromFoldersPrompt(folders: Tree[], shouldContinue: (stage: string, example: string) => boolean) {
        let shouldKeepGoing: boolean | undefined = undefined;

        this.traverseFilesIn(folders, (folder, file) => {
            const { season, episode: episodeNumber } = this.titleParser.parse(file.name);
            const seasonNumber = season ?? this.titleParser.parseSeasonFrom(folder.name);

            if (shouldKeepGoing === false) return;

            if (episodeNumber && seasonNumber) {
                if (shouldKeepGoing === undefined) {
                    let conversion = `\t'S${seasonNumber}E${episodeNumber}' extracted from '${file.name}'\n\t`;
                    conversion += `Season ${seasonNumber} extracted from ${folder.name}`;
                    shouldKeepGoing = shouldContinue('Parsing folders', conversion);

                    if (shouldKeepGoing === false) return;
                }

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
}

export default VirtualTreeBuilderPrompt;