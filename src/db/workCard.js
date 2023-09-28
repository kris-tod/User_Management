import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class WorkCard extends Model {
    static associate({
      WorkCardItem
    }) {
      WorkCard.hasMany(WorkCardItem);
    }
  }

  WorkCard.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'work_card',
    timestamps: false
  });
  WorkCard.tableName = 'work_cards';

  return WorkCard;
};
