import { DataTypes } from 'sequelize';
import { domain } from '../config/index.js';

export default (sequelize) => {
  const Partner = sequelize.define(
    'partner',
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
      logo: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: `${domain}/default_partner_image.jpg`
      },
      description: {
        type: DataTypes.TEXT
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false
      },
      coordinates: {
        type: DataTypes.STRING
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false
      },
      contactPerson: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      tableName: 'partners',
      timestamps: false
    }
  );

  return Partner;
};
