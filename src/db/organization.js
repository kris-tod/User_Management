import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Organization = sequelize.define(
    'organization',
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
      }
    },
    {
      tableName: 'organizations',
      timestamps: false
    }
  );

  return Organization;
};
