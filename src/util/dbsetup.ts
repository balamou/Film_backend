import sequelize from "./database";
import Series from "../model/series";
import Episode from "../model/episode";
import User from "../model/user";

export default async function dbSetup() {
    return;
    Series.hasMany(Episode, {
        sourceKey: "id",
        foreignKey: "seriesId",
        as: "episodes"
    });
    await User.sync();
    await sequelize.sync({ force: true, logging: false });

    return;
    await User.sync();
    await Series.sync();
    await Episode.sync();
    await sequelize.sync({ force: true, logging: false });
}
