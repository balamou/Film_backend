import sequelize from './database';
import Series from '../model/series';
import Episode from '../model/episode';

export default async function dbSetup() {
    Series.hasMany(Episode, {
        sourceKey: 'id',
        foreignKey: 'seriesId',
        as: 'episodes'
      });
    
    await Series.sync();
    await Episode.sync();
    await sequelize.sync({ force: true, logging: false });
}