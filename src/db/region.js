import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Region = sequelize.define(
    'region',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    },
    {
      tableName: 'regions',
      timestamps: false
    }
  );

  return Region;
};
