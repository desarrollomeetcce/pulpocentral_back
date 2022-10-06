'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MassiveMessageList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.MassiveMessage, { foreignKey: 'msgMassiveId'});
    }
  };
  MassiveMessageList.init({

    msgMassiveId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'MassiveMessage', 
        key: 'id', 
      }
    },
    contact: {
      type: DataTypes.STRING
    }, 
    status: {
      type: DataTypes.STRING
    },  
    sendAt:{
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'MassiveMessageList',
    tableName: 'MassiveMessageList'
  });
  return MassiveMessageList;
};

