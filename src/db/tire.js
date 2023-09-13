import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Tire = sequelize.define(
    'tire',
    {
      id: {
        type: DataTypes.BIGINT,
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
      tires_hotel: {
        type: DataTypes.TEXT
      }
    },
    {
      tableName: 'tires',
      timestamps: false
    }
  );

  return Tire;
};
