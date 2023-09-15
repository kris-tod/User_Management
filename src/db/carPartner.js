export default (sequelize) => {
  const CarPartner = sequelize.define(
    'car_partner',
    {},
    {
      tableName: 'cars_partners',
      timestamps: false
    }
  );

  return CarPartner;
};
