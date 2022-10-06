'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Message, { foreignKey: 'chatId'} );
      this.belongsTo(models.WpSession, { foreignKey: 'wpSessionId'});
      this.belongsToMany(models.Tag,{ through: 'ChatTagsRelations' })
    }
  };
  Chat.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      wpSessionId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'WpSessions', 
          key: 'id', 
        }
      },
    whatsappId: {
        type: DataTypes.STRING
      },
      name: {
        type: DataTypes.STRING
      },
      phone:{
        type:DataTypes.STRING
      },
      lastMessage:{
        type: DataTypes.TEXT
      },
      lastUpdated: {
        type: DataTypes.DATE,
      },
      status: {
        type: DataTypes.STRING
      },
      isGroup: {
        type: DataTypes.STRING
      },
      isReadOnly: {
        type: DataTypes.STRING
      },
      unreadCount: {
        type: DataTypes.INTEGER
      },
      timestamp: {
        type: DataTypes.DATE,
      },
      archived: {
        type: DataTypes.STRING
      },
      pinned: {
        type: DataTypes.STRING
      },
      isMuted: {
        type: DataTypes.STRING
      },
      muteExpiration: {
        type: DataTypes.INTEGER
      },
  }, {
    sequelize,
    modelName: 'Chat',
  });
  return Chat;
};

