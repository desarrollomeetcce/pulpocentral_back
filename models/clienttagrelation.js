'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ClientTagRelation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Tag, { foreignKey: 'tagId'});
      this.belongsTo(models.Client, { foreignKey: 'clientId'});

    }
  };
  ClientTagRelation.init({
    tagId: {
      type:DataTypes.INTEGER,   
      references: {
        model: 'Tags', 
        key: 'id'
      },
      primaryKey: true    },
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
    modelName: 'ClientTagRelation',
  });
  return ClientTagRelation;
};