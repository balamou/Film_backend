import CreationManager from '../../database/CreationManager';
import { SeriesData } from '../Orginizer/VirtualTree/VirtualTreeParser';

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

        await cManager.endConnection();
    }
}


export default VirtualTreeDBManagerPrompt;