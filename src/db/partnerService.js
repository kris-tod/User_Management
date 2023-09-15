export default (sequelize) => {
  const PartnerService = sequelize.define(
    'partner_service',
    {},
    {
      tableName: 'partners_services',
      timestamps: false
    }
  );

  return PartnerService;
};
