import { Model } from 'sequelize';

export default (sequelize) => {
  class PartnerService extends Model {}
  PartnerService.init(
    {},
    {
      sequelize,
      modelName: 'partner_service',
      timestamps: false
    }
  );

  PartnerService.tableName = 'partners_services';
  return PartnerService;
};
