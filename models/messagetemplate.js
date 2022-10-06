'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MessageTemplate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
     // this.belongsToMany(models.WebHook,{ through: 'WhWordRelations' })
     this.belongsToMany(models.Word,{ through: 'TemplateWordRelations' })
     this.belongsToMany(models.File,{ through: 'TemplateFileRelations' })
    }
  };
  MessageTemplate.init({
    name: {
      type: DataTypes.STRING
    },
    type: DataTypes.STRING,
    filePath: {
      type: DataTypes.STRING
    },
    fileName: {
      type: DataTypes.STRING
    }, 
    message: {
      type: DataTypes.TEXT
    },
  }, {
    sequelize,
    modelName: 'MessageTemplate'
  });

  return MessageTemplate;
};