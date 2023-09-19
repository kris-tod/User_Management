import { Model } from 'sequelize';

export default (sequelize) => {
  class AdminPartner extends Model {}
  AdminPartner.init(
    {},
    {
      sequelize,
      modelName: 'admin_partner',
      timestamps: false
    }
  );
  AdminPartner.tableName = 'admins_partners';

  return AdminPartner;
};
