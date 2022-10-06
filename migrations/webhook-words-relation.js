'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('WhWordRelations', {
   
      webhookId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      wordId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
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
    await queryInterface.addConstraint('WhWordRelations', {
      fields: ['webhookId'],
      type: 'foreign key',
      references: {
        table: 'WebHooks',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
    await queryInterface.addConstraint('WhWordRelations', {
      fields: ['wordId'],
      type: 'foreign key',
      references: {
        table: 'Words',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('WhWordRelations');
  }
};