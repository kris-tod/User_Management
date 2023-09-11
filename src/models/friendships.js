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
        type: DataTypes.BIGINT,
        allowNull: false
      },
      username: {
        type: DataTypes.STRING
      },
      friend_username: {
        type: DataTypes.STRING
      },
      friend_id: {
        type: DataTypes.BIGINT,
        allowNull: false
      }
    },
    {
      tableName: 'friendships',
      timestamps: false
    }
  );

  return Friendship;
};
