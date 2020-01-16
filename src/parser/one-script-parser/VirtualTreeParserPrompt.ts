import { VirtualTreeParser, SeriesData } from "../Orginizer/VirtualTree/VirtualTreeParser";
import { VirtualTree } from "../Orginizer/VirtualTree/VirtualTree";
import { SeriesInfo } from "./FetcherProtocol";
import { download } from "../Adapters/HTTPReq";
import Prompt from "./prompt";

class VirtualTreeParserPrompt extends VirtualTreeParser {
    private prompt = new Prompt();

    private downloadPoster(path: string, posterURL?: string) {
        const log = console.log;

        if (!posterURL) {
            log(`No poster URL found`);
            const optionSelected = this.prompt.askWithOptions(`Do you want to continue with no poster or add your own url? [A (add)/ N (no poster)]: `, ['A', 'N']);

            if (optionSelected === 'N') {
                return;
            }

            let customURL = this.prompt.ask(`Please enter your poster URL: `);

            return this.download(customURL, path);
        }
        
        log(`The series poster is ${posterURL}.`);
        const optionSelected = this.prompt.askWithOptions(`Do you want to download it or add your own url? [D (download)/A (add)]: `, ['A', 'D']);
        
        let customURL = posterURL;
        if (optionSelected === 'A') {
            customURL = this.prompt.ask(`Please enter your poster URL: `);
        }

        return this.download(customURL, path);
    }   

    private download(posterURL: string, path: string) {
        try {
            const posterPath = download(posterURL, `${path}/poster`); // TODO: append poster extension
            return posterPath;
        } catch {
            console.log(`Unable to download image ${posterURL}`);
            let optionSelected = this.prompt.askWithOptions(`Do you want to add a different URL (A) or continue with no poster(N)? [A/N]: `, ['A', 'N']);

            if (optionSelected === 'N') {
                return;
            }

            const customURL = this.prompt.ask(`Please enter your poster URL: `);
            this.download(customURL, path);
        }
    }

    attachSeriesInfoToVT(path: string, seriesInfo: SeriesInfo, virtualTree: VirtualTree): SeriesData {
        const {title, poster, plot} = seriesInfo.seriesInfo;
        const totalSeasons = seriesInfo.seasons.length;
        const finalPoster = this.downloadPoster(path, poster);

        this.seriesData.addSeriesInfo(title, finalPoster, plot, totalSeasons);

        virtualTree.forEach((season, episode) => {
            const seasonNum = season.seasonNum;
            const episodeNum = episode.episodeNum;
            
            const { title, plot } = this.findEpisode(seriesInfo, seasonNum, episodeNum);

            this.seriesData.insert(seasonNum, episodeNum, episode.path, {
                title: title,
                plot: plot
            });
         
        });

        return this.seriesData;
    }

    private findEpisode(seriesInfo: SeriesInfo, seasonNumber: number, episodeNumber: number) {
        const matchingSeason = seriesInfo.seasons.find( season => season.seasonNumber === seasonNumber);
        if (matchingSeason) {
            const matchingEpisode = matchingSeason.episodes.find(episode => episode.episodeNumber === episodeNumber);

            if (matchingEpisode) return matchingEpisode;
        }

        return { title: undefined, plot: undefined};
    }

}

export default VirtualTreeParserPrompt