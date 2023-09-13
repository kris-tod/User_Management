import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Car = sequelize.define(
    'car',
    {
      id: {
        type: DataTypes.BIGINT,
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
        allowNull: false
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
      tableName: 'cars',
      timestamps: true
    }
  );

  return Car;
};
