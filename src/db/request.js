import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Request extends Model {
    static associate({
      Partner, CarSupportService, Car, Driver
    }) {
      Partner.hasMany(Request);
      Request.belongsTo(Partner);
      CarSupportService.hasMany(Request);
      Request.belongsTo(CarSupportService);
      Car.hasMany(Request);
      Request.belongsTo(Car);
      Driver.hasMany(Request);
      Request.belongsTo(Driver);
    }
  }

  Request.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    carCoordinates: {
      type: DataTypes.STRING,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT
    },
    driveAlone: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    serialNumber: {
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'rejected',
        'accepted',
        'driver_at_address',
        'car_at_service',
        'car_ready',
        'car_driven',
        'done'
      ),
      allowNull: false,
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'request',
    timestamps: false
  });
  Request.tableName = 'requests';

  return Request;
};
