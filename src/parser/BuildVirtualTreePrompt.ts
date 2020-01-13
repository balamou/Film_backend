import { VirtualTreeBuilder } from './Orginizer/VirtualTree/VirtualTreeBuilder';
import Tree from './Tree/Tree';
import { Episode } from './Orginizer/VirtualTree/VirtualTree';
import chalk from 'chalk';

class VirtualTreeBuilderPrompt extends VirtualTreeBuilder {

    buildVirtualTreeFromFilesPrompt(files: Tree[], shouldContinue: (stage: string, example: string) => boolean) {
        let shouldKeepGoing: boolean | undefined = undefined;

        files.forEach(file => {
            const { season, episode } = this.titleParser.parse(file.name);

            if (shouldKeepGoing === false) return;
            
            if (season && episode) {
                if (shouldKeepGoing === undefined) {
                    let seasonEpisodeText = chalk.red(`S${season}E${episode}`);

                    let example = `${seasonEpisodeText} extracted from ${chalk.blue(file.name)}`;

                    shouldKeepGoing = shouldContinue('Parsing files', example);
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
                    let seasonEpisodeText = season === undefined ? chalk.red(`E${episodeNumber}`) : chalk.red(`S${seasonNumber}E${episodeNumber}`);
                    let seasonNumberText = chalk.red(`S${seasonNumber}`);

                    let conversion = '\t';
                    conversion += `${seasonEpisodeText} extracted from file ${chalk.blue(file.path)}\n\t`;

                    if (!season) conversion += `${seasonNumberText} extracted from folder ${chalk.blue(folder.path)}`;
                    
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