import { Model, DataTypes } from "sequelize";
import sequelize from "../util/database";

class User extends Model {
    public id!: number;
    public username!: string;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: new DataTypes.STRING(),
            allowNull: false,
            unique: true
        }
    },
    {
        tableName: "users",
        sequelize: sequelize
    }
);

export default User;
