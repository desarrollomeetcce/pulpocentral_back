'use strict';
const {
  Model
} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    
    
    }
  };
  Group.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    }, 
    name: DataTypes.STRING,
    membersCount: DataTypes.INTEGER,
    userGroupId: {
      type: DataTypes.INTEGER
    },
    sheetId: {
      type: DataTypes.STRING
    },
    columnsStructure: {
      type: DataTypes.STRING
    },
    
  }, {
    sequelize,
    modelName: 'Group',
  });

  return Group;
};