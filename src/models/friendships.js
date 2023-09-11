import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Friendship = sequelize.define(
    'friendship',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.BIGINT
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false
      },
      friend_username: {
        type: DataTypes.STRING,
        allowNull: false
      },
      friend_id: {
        type: DataTypes.BIGINT
      }
    },
    {
      tableName: 'friendships',
      timestamps: false
    }
  );

  return Friendship;
};
