'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MsgFileRelation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.MassiveMessage, { foreignKey: 'massiveMessageId'});
      this.belongsTo(models.File, { foreignKey: 'fileId'});

    }
  };
  MsgFileRelation.init({
    massiveMessageId: {
      type:DataTypes.INTEGER,   
      references: {
        model: 'MassiveMessages', 
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
    modelName: 'MsgFileRelation',
  });
  return MsgFileRelation;
};