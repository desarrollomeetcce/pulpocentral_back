'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ClientCommentRelation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Comment, { foreignKey: 'commentId'});
      this.belongsTo(models.Client, { foreignKey: 'clientId'});

    }
  };
  ClientCommentRelation.init({
    commentId: {
      type:DataTypes.INTEGER,   
      references: {
        model: 'Comments', 
        key: 'id'
      },
      primaryKey: true
    },
    clientId:{
      type:DataTypes.INTEGER,   
      references: {
        model: 'Clients', 
        key: 'id'
      },
      primaryKey: true
    },
  }, {
    sequelize,
    modelName: 'ClientCommentRelation',
  });
  return ClientCommentRelation;
};