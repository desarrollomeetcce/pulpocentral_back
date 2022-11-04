'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TwilioProfileRelation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Profile, { foreignKey: 'profileId'});
      this.belongsTo(models.TwilioPhone, { foreignKey: 'twilioPhoneId'});

    }
  };
  TwilioProfileRelation.init({
    profileId: {
      type:DataTypes.STRING,   
      references: {
        model: 'Profiles', 
        key: 'id'
      },
      primaryKey: true
    },
    twilioPhoneId:{
      type:DataTypes.STRING,   
      references: {
        model: 'TwilioPhones', 
        key: 'id'
      },
      primaryKey: true
    },
  }, {
    sequelize,
    modelName: 'TwilioProfileRelation',
  });
  return TwilioProfileRelation;
};