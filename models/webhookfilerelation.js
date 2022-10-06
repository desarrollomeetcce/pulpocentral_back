'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WebhookFileRelation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.WebHook, { foreignKey: 'webhookId'});
      this.belongsTo(models.File, { foreignKey: 'fileId'});

    }
  };
  WebhookFileRelation.init({
    webhookId: {
      type:DataTypes.INTEGER,   
      references: {
        model: 'Webhooks', 
        key: 'id'
      },
      primaryKey: true
    },
    fileId:{
      type:DataTypes.INTEGER,   
      references: {
        model: 'Files', 
        key: 'id'
      },
      primaryKey: true
    },
  }, {
    sequelize,
    modelName: 'WebhookFileRelation',
  });
  return WebhookFileRelation;
};