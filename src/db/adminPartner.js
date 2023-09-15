export default (sequelize) => {
  const AdminPartner = sequelize.define(
    'admin_partner',
    {},
    {
      tableName: 'admins_partners',
      timestamps: false
    }
  );

  return AdminPartner;
};
