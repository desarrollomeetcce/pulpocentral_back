'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WhWordRelation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.WebHook, { foreignKey: 'webhookId'});
      this.belongsTo(models.Word, { foreignKey: 'wordId'});

    }
  };
  WhWordRelation.init({
    webhookId: {
      type:DataTypes.INTEGER,   
      references: {
        model: 'Webhooks', 
        key: 'id'
      },
      primaryKey: true
    },
    wordId:{
      type:DataTypes.INTEGER,   
      references: {
        model: 'Words', 
        key: 'id'
      },
      primaryKey: true
    },
  }, {
    sequelize,
    modelName: 'WhWordRelation',
  });
  return WhWordRelation;
};