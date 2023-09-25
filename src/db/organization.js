import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Organization extends Model {
    static associate({
      Partner, Admin
    }) {
      Organization.hasMany(Partner);
      Partner.belongsTo(Organization);
      Organization.hasMany(Admin);
      Admin.belongsTo(Organization);
    }
  }

  Organization.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      }
    },
    {
      sequelize,
      modelName: 'organization',
      timestamps: false
    }
  );

  Organization.tableName = 'organizations';
  return Organization;
};
