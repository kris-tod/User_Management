import { DataTypes, Model } from 'sequelize';
import { roles } from '../domain/user/User.js';

export default (sequelize) => {
  class Admin extends Model {
    static associate({
      Partner, Region, AdminPartner
    }) {
      Partner.belongsToMany(Admin, { through: AdminPartner, onDelete: 'CASCADE' });
      Admin.belongsToMany(Partner, { through: AdminPartner, onDelete: 'CASCADE' });

      Region.hasMany(Admin, { onDelete: 'RESTRICT' });
      Admin.belongsTo(Region);
    }
  }

  Admin.init(
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
      }
    },
    {
      sequelize,
      modelName: 'admin',
      timestamps: false
    }
  );
  Admin.tableName = 'admins';
  return Admin;
};
