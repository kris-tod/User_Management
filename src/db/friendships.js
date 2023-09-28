import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Friendship extends Model {}

  Friendship.init(
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
      friend_id: {
        type: DataTypes.BIGINT,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'friendship',
      timestamps: true
    }
  );

  Friendship.tableName = 'friendships';
  return Friendship;
};
