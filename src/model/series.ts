import { Sequelize, Model, DataTypes, BuildOptions, AbstractDataTypeConstructor } from 'sequelize';
import sequelize from '../util/database';

class Series extends Model {
    public id!: number;
    public language!: string;
    public folder!: string; // The location of the top level series folder in public. Example: /en/shows/rick_and_morty/
    public title!: string;
    public seasons!: string; // total seasons as parsed from imdb
    public desc?: string;
    public poster?: string;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Series.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    language: {
        type: new DataTypes.STRING,
        allowNull: false,
        defaultValue: 'en',
        validate: {
            isIn: [['en', 'ru']]
        }
    },
    folder: {
        type: new DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: new DataTypes.STRING,
        allowNull: false
    },
    seasons: {
        type: new DataTypes.INTEGER,
        allowNull: false
    },
    desc: {
        type: new DataTypes.STRING(250),
        allowNull: true,
        set(value: string | undefined) {
            if (value)
                (this as any).setDataValue('desc', value.substring(0, 250)); // work-around
        }
    },
    poster: {
        type: new DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'series',
    sequelize: sequelize,
});

export default Series;