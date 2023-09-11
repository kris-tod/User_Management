import { DataTypes } from 'sequelize';
import { domain } from '../config/index.js';
import { roles } from '../domain/user/User.js';

export default (sequelize) => {
  const User = sequelize.define(
    'user',
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
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: roles.endUser
      },
      avatar: {
        type: DataTypes.STRING,
        defaultValue: `${domain}/default_avatar.jpg`
      }
    },
    {
      tableName: 'users',
      timestamps: false
    }
  );

  return User;
};
