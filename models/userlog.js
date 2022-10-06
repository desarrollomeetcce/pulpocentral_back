'use strict';
const {
  Model
} = require('sequelize');
module.exports= (sequelize, DataTypes) => {
  class UserLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  UserLog.init({
    user: DataTypes.STRING,
    changeType:  DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserLog',
  });
  return UserLog;
};