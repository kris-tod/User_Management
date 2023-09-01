import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Friendship = sequelize.define("friendship", {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        friend_username: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: "friendships",
        timestamps: false
    });

    return Friendship;
}
