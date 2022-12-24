'use strict';
const {
  Model
} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    
      this.belongsTo(models.Profile, { foreignKey: 'profile'});
      this.belongsTo(models.UserGroup, { foreignKey: 'userGroupId'});
    }
  };
  User.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    password: DataTypes.STRING,
    profile: {type: DataTypes.INTEGER,
      references: {
      model: 'Profiles', 
      key: 'id', 
    }},
    userGroupId: {type: DataTypes.INTEGER,
      references: {
      model: 'UserGroups', 
      key: 'id', 
    }},
    
    email: { type:DataTypes.STRING, primaryKey: true},
    status: {
      type: DataTypes.STRING,
    },
    authToken:  DataTypes.STRING,
    socketId: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};