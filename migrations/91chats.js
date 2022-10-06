'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Chats', {
     
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      whatsappId: {
        type: Sequelize.STRING
      },
      wpSessionId: {
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      phone:{
        type: Sequelize.STRING
      },
      lastMessage:{
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.STRING
      },
      isGroup: {
        type: Sequelize.STRING
      },
      isReadOnly: {
        type: Sequelize.STRING
      },
      unreadCount: {
        type: Sequelize.INTEGER
      },
      
      lastUpdated: {
        type: Sequelize.DATE,
      },
      timestamp: {
        type: Sequelize.DATE,
      },
      archived: {
        type: Sequelize.STRING
      },
      pinned: {
        type: Sequelize.STRING
      },
      isMuted: {
        type: Sequelize.STRING
      },
      muteExpiration: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue:  Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue:  Sequelize.fn('NOW')
      }
    })
    await queryInterface.addConstraint('Chats', {
      fields: ['wpSessionId'],
      type: 'foreign key',
      name: 'fkey_chat_session', // optional
      references: {
        table: 'WpSessions',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Chats');
  }
};