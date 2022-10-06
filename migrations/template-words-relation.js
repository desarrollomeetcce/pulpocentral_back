'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TemplateWordRelations', {
   
      messageTemplateId: {
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
    await queryInterface.addConstraint('TemplateWordRelations', {
      fields: ['messageTemplateId'],
      type: 'foreign key',
      references: {
        table: 'MessageTemplates',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
    await queryInterface.addConstraint('TemplateWordRelations', {
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
    await queryInterface.dropTable('TemplateWordRelations');
  }
};