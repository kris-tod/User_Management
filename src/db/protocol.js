import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Protocol extends Model {
    static associate({
      RequestProtocol
    }) {
      Protocol.hasOne(RequestProtocol);
    }
  }

  Protocol.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    fuelAvailable: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        max: 100,
        min: 0
      }
    },
    kilometersTravelled: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    clientName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    clientNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    clientSignature: {
      type: DataTypes.STRING
    },
    driverSignature: {
      type: DataTypes.STRING
    },
    checks: {
      type: DataTypes.JSON,
      defaultValue: {
        triangle: false,
        medicalKit: false
      }
    }
  }, {
    sequelize,
    modelName: 'protocol',
    timestamps: false
  });
  Protocol.tableName = 'protocols';
  return Protocol;
};
