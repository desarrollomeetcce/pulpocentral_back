'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ClientTagRelations', {

      clientId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      tagId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
    await queryInterface.addConstraint('ClientTagRelations', {
      fields: ['clientId'],
      type: 'foreign key',
      references: {
        table: 'Clients',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
    await queryInterface.addConstraint('ClientTagRelations', {
      fields: ['tagId'],
      type: 'foreign key',
      references: {
        table: 'Tags',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ClientTagRelations');
  }
};