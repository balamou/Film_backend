import Sequelize from 'sequelize';
import sequelize from '../util/database';

const notNullString = {
    type: Sequelize.STRING,
    allowNull: false
}

const Series = sequelize.define('series', {
    language: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'en',
        validate: {
            isIn: [['en', 'ru']]
        }
    },
    // the location of the top level series folder in public.
    // example: /en/shows/rick_and_morty/
    folder: notNullString,
    title: notNullString,
    seasons: { // total seasons as parsed from imdb
        type: Sequelize.INTEGER,
        allowNull: false
    },
    desc: Sequelize.STRING, 
    poster: Sequelize.STRING
});

export default Series;