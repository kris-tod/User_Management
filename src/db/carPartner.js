import { Model } from 'sequelize';

export default (sequelize) => {
  class CarPartner extends Model {}
  CarPartner.init(
    {},
    {
      sequelize,
      modelName: 'car_partner',
      timestamps: false
    }
  );

  CarPartner.tableName = 'cars_partners';
  return CarPartner;
};
