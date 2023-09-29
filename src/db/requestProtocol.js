import { Model } from 'sequelize';

export default (sequelize) => {
  class RequestProtocol extends Model {
    static associate({
      Request, Protocol
    }) {
      RequestProtocol.belongsTo(Request);
      RequestProtocol.belongsTo(Protocol, { foreignKey: 'preliminaryId', as: 'preliminaryProtocol' });
      RequestProtocol.belongsTo(Protocol, { foreignKey: 'transmissiveId', as: 'transmissiveProtocol' });
    }
  }

  RequestProtocol.init({}, {
    sequelize,
    modelName: 'request_protocol',
    timestamps: false
  });
  RequestProtocol.tableName = 'requests_protocols';
  return RequestProtocol;
};
