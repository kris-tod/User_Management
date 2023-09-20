import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Tire extends Model {}

  Tire.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
        primaryKey: true
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: false
      },
      count: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      width: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      ratio: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM(['winter', 'summer', 'allseasons']),
        allowNull: false
      },
      used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      comment: {
        type: DataTypes.TEXT
      },
      tiresHotel: {
        type: DataTypes.TEXT
      }
    },
    {
      sequelize,
      modelName: 'tire',
      timestamps: false
    }
  );
  Tire.tableName = 'tires';
  return Tire;
};
