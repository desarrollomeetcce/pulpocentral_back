'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Messages', {
     
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      wpId: {
        type: Sequelize.STRING
      },
      chatId: {
        type: Sequelize.INTEGER
      },
      ack: {
        type: Sequelize.INTEGER
      },
      hasMedia:{
        type: Sequelize.STRING
      },
      body: {
        type: Sequelize.TEXT
      },
      mediaUrl: {
        type: Sequelize.TEXT
      },
      type: {
        type: Sequelize.STRING
      },
      timestamp: {
        type: Sequelize.DATE
      },
      from: {
        type: Sequelize.STRING
      },
      to: {
        type: Sequelize.STRING
      },
      deviceType: {
        type: Sequelize.STRING
      },
      isForwarded: {
        type: Sequelize.STRING
      },
      forwardingScore: {
        type: Sequelize.INTEGER
      },
      isStatus: {
        type: Sequelize.STRING
      },
      isStarred: {
        type: Sequelize.STRING
      },
      broadcast: {
        type: Sequelize.STRING
      },
      fromMe: {
        type: Sequelize.STRING
      },
      hasQuotedMsg: {
        type: Sequelize.STRING
      },
      mentionedIds: {
        type: Sequelize.STRING
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
    await queryInterface.addConstraint('Messages', {
      fields: ['chatId'],
      type: 'foreign key',
      name: 'fkey_message_chat2', // optional
      references: {
        table: 'Chats',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Messages');
  }
};