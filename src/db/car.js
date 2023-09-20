import { DataTypes, Model } from 'sequelize';
import { domain } from '../config/index.js';

export default (sequelize) => {
  class Car extends Model {
    static associate({
      Tire, User, Partner, UserCar, CarPartner
    }) {
      Car.hasMany(Tire);
      Tire.belongsTo(Car);
      User.belongsToMany(Car, { through: UserCar, onDelete: 'CASCADE' });
      Car.belongsToMany(User, { through: UserCar, onDelete: 'CASCADE' });
      Car.belongsToMany(Partner, { through: CarPartner, onDelete: 'CASCADE' });
      Partner.belongsToMany(Car, { through: CarPartner, onDelete: 'CASCADE' });
    }
  }
  Car.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      idNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: `${domain}/default_car_image.jpg`
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: false
      },
      kilometers: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      engineType: {
        type: DataTypes.ENUM(['diesel', 'gasoline']),
        allowNull: false
      },
      yearOfProduction: {
        type: DataTypes.INTEGER
      },
      frameNumber: {
        type: DataTypes.STRING
      },
      technicalReviewExpiration: {
        type: DataTypes.DATE
      },
      civilEnsuranceExpiration: {
        type: DataTypes.DATE
      },
      vignetteExpiration: {
        type: DataTypes.DATE
      },
      autoEnsuranceExpiration: {
        type: DataTypes.DATE
      },
      leasingExpiration: {
        type: DataTypes.DATE
      },
      comment: {
        type: DataTypes.TEXT
      },
      vehicleType: {
        type: DataTypes.STRING
      }
    },
    {
      sequelize,
      modelName: 'car',
      timestamps: false
    }
  );

  Car.tableName = 'cars';

  return Car;
};
