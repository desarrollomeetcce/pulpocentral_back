'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PermProfileRelation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Profile, { foreignKey: 'profileId'});
      this.belongsTo(models.Permission, { foreignKey: 'permissionId'});

    }
  };
  PermProfileRelation.init({
    profileId: {
      type:DataTypes.STRING,   
      references: {
        model: 'Profiles', 
        key: 'id'
      },
      primaryKey: true
    },
    permissionId:{
      type:DataTypes.STRING,   
      references: {
        model: 'Permissions', 
        key: 'id'
      },
      primaryKey: true
    },
  }, {
    sequelize,
    modelName: 'PermProfileRelation',
  });
  return PermProfileRelation;
};