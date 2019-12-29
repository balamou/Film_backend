import Facade from './Facade';

const paths = {
    shows: [{ language: 'en', path: 'public/en/shows' }, { language: 'ru', path: 'public/ru/shows' }],
    movies: [{ language: 'en', path: 'public/en/movies' }, { language: 'ru', path: 'public/ru/movies' }]
};

export default function main() {
    paths.shows.forEach(x => Facade.bulkSeriesRefresh(x.path, x.language));
    paths.movies.forEach(x => orginizeMovies(x.path, x.language));
}

function orginizeMovies(path: string, language: string) {

    // Get tree
    // BFS find first video
    //  move it up & rename
    // purge the rest
    // fetch info
    // add to db
    // save diff

}
