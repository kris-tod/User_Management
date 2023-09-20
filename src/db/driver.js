import { DataTypes, Model } from 'sequelize';
import { domain } from '../config/index.js';

export default (sequelize) => {
  class Driver extends Model {
    static associate({
      Region
    }) {
      Region.hasMany(Driver);
      Driver.belongsTo(Region);
    }
  }

  Driver.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: `${domain}/default_driver_image.jpg`
    },
    description: {
      type: DataTypes.TEXT
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pushNotificationsToken: {
      type: DataTypes.STRING,
      allowNull: false
    },
    signature: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'driver',
    timestamps: false
  });

  Driver.tableName = 'drivers';
  return Driver;
};
