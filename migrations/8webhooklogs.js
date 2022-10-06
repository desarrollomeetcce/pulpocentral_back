'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('WebHookLogs', {
     
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idHook: {
        type: Sequelize.INTEGER
      },
      phone: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      data: {
        type: Sequelize.TEXT
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
    await queryInterface.addConstraint('WebHookLogs', {
      fields: ['idHook'],
      type: 'foreign key',
      name: 'fkey_logsidhook_webhooks', // optional
      references: {
        table: 'WebHooks',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('WebHookLogs');
  }
};