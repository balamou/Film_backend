import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('film', 'michelbalamou', '', {
    host: 'localhost',
    dialect: 'postgres'
});

export default sequelize;
