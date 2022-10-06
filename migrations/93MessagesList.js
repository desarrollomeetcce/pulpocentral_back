'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MessageTemplates', {
     
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      type:{
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.TEXT
      }, 
      filePath: {
        type: Sequelize.STRING
      }, 
      fileName: {
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
    await queryInterface.dropTable('MessageTemplates');
  }
};