import { DataTypes } from 'sequelize';
import { domain } from '../config/index.js';

export default (sequelize) => {
  const CarSupportService = sequelize.define(
    'car_support_service',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: `${domain}/default_support_service_image.webp`
      },
      region: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isRegionDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isPromoted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      tableName: 'car_support_services',
      timestamps: false
    }
  );

  return CarSupportService;
};
