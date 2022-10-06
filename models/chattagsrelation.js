'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatTagsRelation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Chat, { foreignKey: 'chatId'});
      this.belongsTo(models.Tag, { foreignKey: 'tagId'});

    }
  };
  ChatTagsRelation.init({
    chatId: {
      type:DataTypes.STRING,   
      references: {
        model: 'Chat', 
        key: 'id'
      },
      primaryKey: true
    },
    tagId:{
      type:DataTypes.STRING,   
      references: {
        model: 'Tag', 
        key: 'id'
      },
      primaryKey: true
    },
  }, {
    sequelize,
    modelName: 'ChatTagsRelation',
  });
  return ChatTagsRelation;
};