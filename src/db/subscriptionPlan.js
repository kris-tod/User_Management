import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class SubscriptionPlan extends Model {}

  SubscriptionPlan.init(
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
      price: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      commissionPerRequest: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      carsLimit: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'subscription_plan',
      timestamps: false
    }
  );

  SubscriptionPlan.tableName = 'subscription_plans';
  return SubscriptionPlan;
};
