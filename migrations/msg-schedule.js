'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MsgSchedules', {
   
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      idWebhook: {
        type: Sequelize.INTEGER
      },
      idTemplate: {
        type: Sequelize.INTEGER
      },
      idMassive: {
        type: Sequelize.INTEGER
      },
      delay:{
        type: Sequelize.INTEGER,
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
    });
    await queryInterface.addConstraint('MsgSchedules', {
      fields: ['idWebhook'],
      type: 'foreign key',
      references: {
        table: 'WebHooks',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
    await queryInterface.addConstraint('MsgSchedules', {
      fields: ['idTemplate'],
      type: 'foreign key',
      references: {
        table: 'MessageTemplates',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MsgSchedules');
  }
};