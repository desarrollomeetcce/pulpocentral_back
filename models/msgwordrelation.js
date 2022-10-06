'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MsgWordRelation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.MassiveMessage, { foreignKey: 'massiveMessageId'});
      this.belongsTo(models.Word, { foreignKey: 'wordId'});

    }
  };
  MsgWordRelation.init({
    massiveMessageId: {
      type:DataTypes.INTEGER,   
      references: {
        model: 'MassiveMessages', 
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
    modelName: 'MsgWordRelation',
  });
  return MsgWordRelation;
};