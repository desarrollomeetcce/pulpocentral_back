'use strict';
const {
  Model
} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class WebHookLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    
    }
  };
  WebHookLog.init({

    idHook: {
        type: DataTypes.INTEGER
      },
      phone: {
        type: DataTypes.STRING
      },
      status: {
        type: DataTypes.STRING
      },
      data: {
        type: DataTypes.TEXT
      },
  }, {
    sequelize,
    modelName: 'WebHookLog',
  });

  return WebHookLog;
};