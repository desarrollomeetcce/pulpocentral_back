'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TemplateFileRelation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.MessageTemplate, { foreignKey: 'messagetemplateId'});
      this.belongsTo(models.File, { foreignKey: 'fileId'});

    }
  };
  TemplateFileRelation.init({
    messagetemplateId: {
      type:DataTypes.INTEGER,   
      references: {
        model: 'MessageTemplate', 
        key: 'id'
      },
      primaryKey: true
    },
    fileId:{
      type:DataTypes.INTEGER,   
      references: {
        model: 'File', 
        key: 'id'
      },
      primaryKey: true
    },
  }, {
    sequelize,
    modelName: 'TemplateFileRelation',
  });
  return TemplateFileRelation;
};