'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WpProfileRelation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Profile, { foreignKey: 'profileId'});
      this.belongsTo(models.WpSession, { foreignKey: 'wordpresssystemId'});

    }
  };
  WpProfileRelation.init({
    profileId: {
      type:DataTypes.STRING,   
      references: {
        model: 'Profiles', 
        key: 'id'
      },
      primaryKey: true
    },
    wpsessionId:{
      type:DataTypes.STRING,   
      references: {
        model: 'WpSessions', 
        key: 'id'
      },
      primaryKey: true
    },
  }, {
    sequelize,
    modelName: 'WpProfileRelation',
  });
  return WpProfileRelation;
};