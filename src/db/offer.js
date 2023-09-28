import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Offer extends Model {
    static associate({
      OfferItem, Request
    }) {
      Offer.hasMany(OfferItem);
      Offer.belongsTo(Request);
    }
  }

  Offer.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isAccepted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'offer',
      timestamps: false
    }
  );
  Offer.tableName = 'offers';
  return Offer;
};
