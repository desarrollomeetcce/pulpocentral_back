'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MassiveMessage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.MassiveMessageList, { foreignKey: 'msgMassiveId'} );
      this.belongsToMany(models.Word,{ through: 'MsgWordRelation' })
      this.belongsToMany(models.File,{ through: 'MsgFileRelations' })
      
    }
  };
  MassiveMessage.init({
    name: {
      type: DataTypes.STRING
    },
    kind: {
      type: DataTypes.STRING
    },
    resendId:{
      type: DataTypes.INTEGER
    },
    forwardingId: {
      type: DataTypes.INTEGER
    },
    wpId: {
      type: DataTypes.STRING
    },
    isMedia:{
      type: DataTypes.STRING
    },
    body: {
      type: DataTypes.TEXT
    },
    mediaUrl: {
      type: DataTypes.TEXT
    },
    userSend: {
      type: DataTypes.STRING
    },
    delay: {
      type: DataTypes.BIGINT
    },
    status: {
      type: DataTypes.STRING
    },
    totalMessagesSend: {
      type: DataTypes.INTEGER
    },
    totalMessagesLost: {
      type: DataTypes.INTEGER
    },
    totalMessages: {
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    modelName: 'MassiveMessage',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci', 
  });
  return MassiveMessage;
};

