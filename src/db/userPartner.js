export default (sequelize) => {
  const UserPartner = sequelize.define(
    'user_partner',
    {},
    {
      tableName: 'users_partners',
      timestamps: false
    }
  );

  return UserPartner;
};
