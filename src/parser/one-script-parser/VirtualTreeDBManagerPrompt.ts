import CreationManager, { EpisodeType } from '../../database/CreationManager';
import { SeriesData } from '../Orginizer/VirtualTree/VirtualTreeParser';
import { EpisodeInfo } from '../Orginizer/VirtualTree/VirtualTreeParser';

class VirtualTreeDBManagerPrompt {
    private readonly language: string; // 'en' or 'ru'
    private readonly descriptionLength = 400;
    private readonly episodePlotLength = 400;
    private readonly staticDirectory = /public\//;

    constructor(language: string) {
        this.language = language;
    }

    async commitToDB(path: string, seriesName: string, seriesData: SeriesData) {
        const cManager = new CreationManager();
        const { seriesInfo, episodesInfo } = seriesData;

        const { id: seriesId } = await cManager.createOrUpdateSeries({
            language: this.language,
            folder: path,
            title: seriesInfo?.title ?? seriesName,
            seasons: seriesInfo?.totalSeasons,
            description: seriesInfo?.plot?.substring(0, this.descriptionLength),
            poster: seriesInfo?.poster?.replace(this.staticDirectory, '')
        });

        const processed = this.processEpisodes(seriesId!, episodesInfo);
        await cManager.createOrUpdateEpisodes(processed);
        await cManager.endConnection();
    }

    private processEpisodes(seriesId: number, episodesInfo: EpisodeInfo[]) {
        const processed: EpisodeType[] = [];

        episodesInfo.forEach(item => {
            if (!item.duration) return; // filter out invalid episodes

            processed.push({
                seriesId: seriesId,
                seasonNumber: item.season,
                episodeNumber: item.episode,
                videoURL: item.videoPath.replace(this.staticDirectory, ''),
                duration: item.duration,
                thumbnailURL: item.thumbnail?.replace(this.staticDirectory, ''),
                title: item.title,
                plot: item.plot?.substring(0, this.episodePlotLength)
            });
        });

        return processed;
    }
}


export default VirtualTreeDBManagerPrompt;