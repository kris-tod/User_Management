import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const SubscriptionPlan = sequelize.define(
    'subscription_plan',
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
      carsCount: {
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
      tableName: 'subscription_plans',
      timestamps: false
    }
  );

  return SubscriptionPlan;
};
