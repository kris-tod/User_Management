import { Model } from 'sequelize';

export default (sequelize) => {
  class UserCar extends Model {}
  UserCar.init(
    {},
    {
      sequelize,
      modelName: 'user_car',
      timestamps: false
    }
  );

  UserCar.tableName = 'users_cars';
  return UserCar;
};
