import { DataTypes, Model } from 'sequelize';
import { domain } from '../config/index.js';

export default (sequelize) => {
  class Partner extends Model {
    static associate({
      Region, SubscriptionPlan, UserPartner, User, Driver
    }) {
      Region.hasMany(Partner, { onDelete: 'RESTRICT' });
      Partner.belongsTo(Region);

      SubscriptionPlan.hasMany(Partner, { onDelete: 'RESTRICT' });
      Partner.belongsTo(SubscriptionPlan);

      User.belongsToMany(Partner, { through: UserPartner, onDelete: 'CASCADE' });
      Partner.belongsToMany(User, { through: UserPartner, onDelete: 'CASCADE' });

      Partner.hasMany(Driver);
      Driver.belongsTo(Partner);
    }
  }

  Partner.init(
    {
      id: {
        type: DataTypes.INTEGER,
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
      sequelize,
      modelName: 'partner',
      timestamps: false
    }
  );

  Partner.tableName = 'partners';

  return Partner;
};
