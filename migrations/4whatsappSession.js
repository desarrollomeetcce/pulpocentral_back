'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('WpSessions', {
     
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sessionAuth: {
        type: Sequelize.STRING
      },
      qr: {
        type: Sequelize.STRING
      },
      color: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      loadMessages: {
        type: Sequelize.STRING
      },
      loadedChats: {
        type: Sequelize.INTEGER
      },
      totalChats: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      },
      welcomeMessage: {
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
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('WpSessions');
  }
};