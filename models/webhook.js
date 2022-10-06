'use strict';
const {
  Model
} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class WebHook extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    
      this.hasMany(models.WebHookLog, { foreignKey: 'idHook'});
      this.belongsToMany(models.Word,{ through: 'WhWordRelations' })
      this.belongsToMany(models.File,{ through: 'WebhookFileRelations' })
    }
  };
  WebHook.init({

      name: {
        type: DataTypes.STRING
      },
      mediaPath: {
        type: DataTypes.STRING
      },
      sessionAuth: {
        type: DataTypes.STRING
      },
      token: {
        type: DataTypes.STRING
      },
      message: {
        type: DataTypes.TEXT
      },
      status:{
        type: DataTypes.STRING
      },
  }, {
    sequelize,
    modelName: 'WebHook',
  });

  return WebHook;
};