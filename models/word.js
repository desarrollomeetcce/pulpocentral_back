'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Word extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.WebHook,{ through: 'WhWordRelations' })
      this.belongsToMany(models.MassiveMessage,{ through: 'MsgWordRelation' })
    }
  };
  Word.init({
    name: {
      type: DataTypes.STRING
    },
    word: {
      type: DataTypes.STRING
    },
    replace: {
      type: DataTypes.TEXT
    },
  }, {
    sequelize,
    modelName: 'Word'
  });

  return Word;
};