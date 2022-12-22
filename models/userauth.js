'use strict';
const {
  Model
} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class UserAuth extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    
      this.belongsTo(models.User, { foreignKey: 'userId'});
    }
  };
  UserAuth.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    refresh_token: DataTypes.STRING,
    client_secret: DataTypes.STRING,
    client_id: DataTypes.STRING,
    userId: {type: DataTypes.INTEGER,
      references: {
      model: 'Users', 
      key: 'id', 
    }},
    type: { type:DataTypes.STRING},
  }, {
    sequelize,
    modelName: 'UserAuth',
  });

  return UserAuth;
};