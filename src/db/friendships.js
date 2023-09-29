import { Model } from 'sequelize';

export default (sequelize) => {
  class Friendship extends Model {}

  Friendship.init(
    {},
    {
      sequelize,
      modelName: 'friendship',
      timestamps: true
    }
  );

  Friendship.tableName = 'friendships';
  return Friendship;
};
