'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WpSession extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
    }
  };
  WpSession.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      loadMessages: {
        type: DataTypes.STRING
      },
      sessionAuth: {
        type: DataTypes.STRING
      },
      qr: {
        type: DataTypes.STRING
      },
      color: {
        type: DataTypes.STRING
      },
      status: {
        type: DataTypes.STRING
      },
      loadMessages: {
        type: DataTypes.STRING
      },
      loadedChats: {
        type: DataTypes.INTEGER
      },
      totalChats: {
        type: DataTypes.INTEGER
      },
      name: {
        type: DataTypes.STRING
      },
      welcomeMessage: {
        type: DataTypes.STRING
      },
  }, {
    sequelize,
    modelName: 'WpSession',
  });
  return WpSession;
};