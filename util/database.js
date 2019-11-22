const Sequelize = require('sequelize');

const sequelize = new Sequelize('film', 'michelbalamou', '', {
    host: 'localhost',
    dialect: 'postgres'
});

module.exports = sequelize;
