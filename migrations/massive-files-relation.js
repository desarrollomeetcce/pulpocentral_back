'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MsgFileRelations', {
   
      massiveMessageId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      fileId: {
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
    await queryInterface.addConstraint('MsgFileRelations', {
      fields: ['massiveMessageId'],
      type: 'foreign key',
      references: {
        table: 'MassiveMessages',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
    await queryInterface.addConstraint('MsgFileRelations', {
      fields: ['fileId'],
      type: 'foreign key',
      references: {
        table: 'Files',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MsgFileRelations');
  }
};