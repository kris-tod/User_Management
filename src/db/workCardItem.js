import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class WorkCardItem extends Model {
    static associate({
      WorkCard
    }) {
      WorkCardItem.belongsTo(WorkCard);
    }
  }

  WorkCardItem.init({
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
    modelName: 'work_card_item',
    timestamps: false
  });
  WorkCardItem.tableName = 'work_card_items';
  return WorkCardItem;
};
