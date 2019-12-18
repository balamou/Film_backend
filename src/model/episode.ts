import { Sequelize, Model, DataTypes, BuildOptions } from 'sequelize';
import sequelize from '../util/database';

class Episode extends Model {
    public id!: number;
    public seriesId!: number;
    public episodeNumber!: number;
    public seasonNumber!: number;
    public videoURL!: string;
    public duration!: number;

    public thumbnailURL?: string | null;
    public title?: string | null;
    public plot?: string | null;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Episode.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    seriesId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    episodeNumber: {
        type: new DataTypes.INTEGER,
        allowNull: false,
    },
    seasonNumber: {
        type: new DataTypes.INTEGER,
        allowNull: false
    },
    videoURL: {
        type: new DataTypes.STRING,
        allowNull: false
    },
    duration: {
        type: new DataTypes.INTEGER,
        allowNull: false
    },
    thumbnailURL: {
        type: new DataTypes.STRING,
        allowNull: true
    },
    title: {
        type: new DataTypes.STRING,
        allowNull: true
    },
    plot: {
        type: new DataTypes.STRING(250),
        allowNull: true,
        set(value: string | undefined) {
            if (value)
                (this as any).setDataValue('plot', value.substring(0, 250)); // work-around
        }
    }
}, {
    tableName: 'episodes',
    sequelize: sequelize,
});

export default Episode;