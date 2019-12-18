import sequelize from './database';
import series from '../model/series';
import Episode from '../model/episode';

export default async function dbSetup() {
    await series.sync();
    await Episode.sync();
    await sequelize.sync({ force: true, logging: false });
}