'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ClientCommentRelations', {

      clientId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      commentId: {
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
    await queryInterface.addConstraint('ClientCommentRelations', {
      fields: ['clientId'],
      type: 'foreign key',
      references: {
        table: 'Clients',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
    await queryInterface.addConstraint('ClientCommentRelations', {
      fields: ['commentId'],
      type: 'foreign key',
      references: {
        table: 'Comments',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ClientCommentsRelations');
  }
};