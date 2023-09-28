import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class OfferItem extends Model {
    static associate({
      Offer
    }) {
      OfferItem.belongsTo(Offer);
    }
  }

  OfferItem.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'offer_item',
    timestamps: false
  });
  OfferItem.tableName = 'offers_items';
  return OfferItem;
};
