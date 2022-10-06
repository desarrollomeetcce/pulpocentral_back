'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
     
    }
  };
  Message.init({
    wpId: {
      type: DataTypes.STRING
    },
    chatId: {
      type: DataTypes.INTEGER
    },
    ack: {
      type: DataTypes.INTEGER
    },
    hasMedia:{
      type: DataTypes.STRING
    },
    body: {
      type: DataTypes.TEXT
    },
    mediaUrl: {
      type: DataTypes.TEXT
    },
    type: {
      type: DataTypes.STRING
    },
    timestamp: {
      type: DataTypes.DATE
    },
    from: {
      type: DataTypes.STRING
    },
    to: {
      type: DataTypes.STRING
    },
    deviceType: {
      type: DataTypes.STRING
    },
    isForwarded: {
      type: DataTypes.STRING
    },
    forwardingScore: {
      type: DataTypes.INTEGER
    },
    isStatus: {
      type: DataTypes.STRING
    },
    isStarred: {
      type: DataTypes.STRING
    },
    broadcast: {
      type: DataTypes.STRING
    },
    fromMe: {
      type: DataTypes.STRING
    },
    hasQuotedMsg: {
      type: DataTypes.STRING
    },
    mentionedIds: {
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    modelName: 'Message',
  });
  return Message;
};

