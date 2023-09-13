import { DataTypes } from 'sequelize';
import { roles } from '../domain/user/User.js';

export default (sequelize) => {
  const Admin = sequelize.define(
    'admin',
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
        defaultValue: roles.admin
      },
      region: {
        type: DataTypes.STRING
      }
    },
    {
      tableName: 'admins',
      timestamps: false
    }
  );

  return Admin;
};
