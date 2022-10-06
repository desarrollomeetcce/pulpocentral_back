'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ChatTagsRelations', {

      chatId: {
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
    await queryInterface.addConstraint('ChatTagsRelations', {
      fields: ['chatId'],
      type: 'foreign key',
      references: {
        table: 'Chats',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
    await queryInterface.addConstraint('ChatTagsRelations', {
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
    await queryInterface.dropTable('ChatTagsRelations');
  }
};