'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MassiveMessages', {
     
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      kind: {
        type: Sequelize.STRING
      },
      resendId: {
        type: Sequelize.INTEGER,
        default: 0
      },
      forwardingId: {
        type: Sequelize.INTEGER,
        default: 0
      },
      wpId: {
        type: Sequelize.STRING
      },
      isMedia:{
        type: Sequelize.STRING
      },
      body: {
        type: Sequelize.TEXT
      },
      mediaUrl: {
        type: Sequelize.TEXT
      },
      userSend: {
        type: Sequelize.STRING
      },
      delay: {
        type: Sequelize.BIGINT
      },
      status: {
        type: Sequelize.STRING
      },
      totalMessagesSend: {
        type: Sequelize.INTEGER
      },
      totalMessagesLost: {
        type: Sequelize.INTEGER
      },
      totalMessages: {
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
  
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MassiveMessages');
  }
};