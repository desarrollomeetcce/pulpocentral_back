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
    email: { type:DataTypes.STRING, primaryKey: true}
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};