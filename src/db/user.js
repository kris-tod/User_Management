import { DataTypes, Model } from 'sequelize';
import { domain } from '../config/index.js';

export default (sequelize) => {
  class User extends Model {}

  User.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      avatar: {
        type: DataTypes.STRING,
        defaultValue: `${domain}/default_avatar.jpg`
      }
    },
    {
      sequelize,
      modelName: 'user',
      timestamps: false
    }
  );

  User.tableName = 'users';
  return User;
};
