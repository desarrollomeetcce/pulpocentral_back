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
      status: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      idTemplate: {
        type: Sequelize.INTEGER
      },
      idMassive: {
        type: Sequelize.INTEGER
      },
      user:{
        type: Sequelize.STRING,
      },
      sendAt:{
        type: Sequelize.DATE,
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
      fields: ['idTemplate'],
      type: 'foreign key',
      references: {
        table: 'MessageTemplates',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
    await queryInterface.addConstraint('MsgSchedules', {
      fields: ['idMassive'],
      type: 'foreign key',
      references: {
        table: 'MassiveMessages',
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