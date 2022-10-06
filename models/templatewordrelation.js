'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TemplateWordRelation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.MessageTemplate, { foreignKey: 'messageTemplateId'});
      this.belongsTo(models.Word, { foreignKey: 'wordId'});

    }
  };
  TemplateWordRelation.init({
    messageTemplateId: {
      type:DataTypes.INTEGER,   
      references: {
        model: 'MessageTemplates', 
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
    modelName: 'TemplateWordRelation',
  });
  return TemplateWordRelation;
};