import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Region extends Model {
    static associate({
      User, Driver
    }) {
      Region.hasMany(User, { onDelete: 'RESTRICT' });
      User.belongsTo(Region);
      Region.hasOne(Driver);
      Driver.belongsTo(Region);
    }
  }
  Region.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    },
    {
      sequelize,
      modelName: 'region',
      timestamps: false
    }
  );

  Region.tableName = 'regions';
  return Region;
};
