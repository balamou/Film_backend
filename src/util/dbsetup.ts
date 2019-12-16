import sequelize from './database';
import series from '../model/series';
import episode from '../model/episode';

export default async function dbSetup() {
    await series.sync();
    await episode.sync();
    await sequelize.sync({ force: true, logging: false });
}