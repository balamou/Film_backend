import Facade from './Facade';
import MovieOrginizer from './Orginizer/MovieOrginizer';

const paths = { // TODO: move those paths into a config file
    shows: [{ language: 'en', path: 'public/en/shows' }, { language: 'ru', path: 'public/ru/shows' }], 
    movies: [{ language: 'en', path: 'public/en/movies' }, { language: 'ru', path: 'public/ru/movies' }]
};

export default function main() {
    const movieOrginizer = new MovieOrginizer();

    paths.shows.forEach(x => Facade.bulkSeriesRefresh(x.path, x.language));
    paths.movies.forEach(x => movieOrginizer.orginizeMovies(x.path, x.language));
}

