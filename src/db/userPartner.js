import { Model } from 'sequelize';

export default (sequelize) => {
  class UserPartner extends Model {}
  UserPartner.init(
    {},
    {
      sequelize,
      modelName: 'user_partner',
      timestamps: false
    }
  );

  UserPartner.tableName = 'users_partners';
  return UserPartner;
};
