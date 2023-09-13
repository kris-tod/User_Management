export default (sequelize) => {
  const Tire = sequelize.define(
    'user_car',
    {},
    {
      tableName: 'users_cars',
      timestamps: false
    }
  );

  return Tire;
};
