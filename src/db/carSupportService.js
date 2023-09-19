import { DataTypes, Model } from 'sequelize';
import { domain } from '../config/index.js';

export default (sequelize) => {
  class CarSupportService extends Model {
    static associate({
      Partner, PartnerService, Region
    }) {
      Partner.belongsToMany(CarSupportService, { through: PartnerService, onDelete: 'CASCADE' });
      CarSupportService.belongsToMany(Partner, { through: PartnerService, onDelete: 'CASCADE' });
      Region.hasMany(CarSupportService, { onDelete: 'RESTRICT' });
      CarSupportService.belongsTo(Region);
    }
  }

  CarSupportService.init(
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
      sequelize,
      modelName: 'car_support_service',
      timestamps: false
    }
  );

  CarSupportService.tableName = 'car_support_services';
  return CarSupportService;
};
