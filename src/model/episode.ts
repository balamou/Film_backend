import Sequelize from 'sequelize';
import sequelize from '../util/database';

// export interface EpisodeAttributes {
//     id?: number;
//     episodeNumber: number;
//     seasonNumber: number;
//     videoURL: string;
//     duration: number;
    
//     thumbnailURL?: string;
//     title?: string;
//     plot?: string;

//     createdAt?: Date;
//     updatedAt?: Date;
// }

const Episode = sequelize.define('series', {
    episodeNumber: { type: Sequelize.INTEGER, allowNull: false },
    seasonNumber: { type: Sequelize.INTEGER, allowNull: false },
    videoURL: { type: Sequelize.STRING, allowNull: false },
    duration: Sequelize.INTEGER,
    
    thumbnailURL: { type: Sequelize.STRING, allowNull: true },
    title: { type: Sequelize.STRING, allowNull: true },
    plot: { type: Sequelize.STRING, allowNull: true }
});

export default Episode;