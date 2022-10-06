'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PermProfileRelations', {
   
      profileId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      permissionId: {
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
    await queryInterface.addConstraint('PermProfileRelations', {
      fields: ['profileId'],
      type: 'foreign key',
      references: {
        table: 'Profiles',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
    await queryInterface.addConstraint('PermProfileRelations', {
      fields: ['permissionId'],
      type: 'foreign key',
      references: {
        table: 'Permissions',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PermProfileRelations');
  }
};