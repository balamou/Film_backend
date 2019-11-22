const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const notNullString = {
    type: Sequelize.STRING,
    allowNull: false
}

const Series = sequelize.define('series', {
    language: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'en'
    },
    // the location of the top level series folder in public.
    // example: /en/shows/rick_and_morty/
    folder: notNullString,
    title: notNullString,
    seasons: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    desc: Sequelize.STRING, 
    poster: Sequelize.STRING
});

module.exports = Series;