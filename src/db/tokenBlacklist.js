import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class TokenBlacklist extends Model {}

  TokenBlacklist.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      token: {
        type: DataTypes.STRING(400),
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'token_blacklist',
      timestamps: false
    }
  );

  TokenBlacklist.tableName = 'token_blacklist';
  return TokenBlacklist;
};
