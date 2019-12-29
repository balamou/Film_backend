import Facade from './Facade';

const paths = {
    shows: [{ language: 'en', path: 'public/en/shows' }, { language: 'ru', path: 'public/ru/shows' }],
    movies: [{ language: 'en', path: 'public/en/movies' }, { language: 'ru', path: 'public/ru/movies' }]
};

export default function main() {
    paths.shows.forEach(x => Facade.bulkSeriesRefresh(x.path, x.language));
}
