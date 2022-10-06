'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('WpProfileRelations', {
   
      profileId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      wpsessionId: {
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
    await queryInterface.addConstraint('WpProfileRelations', {
      fields: ['profileId'],
      type: 'foreign key',
      references: {
        table: 'Profiles',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
    await queryInterface.addConstraint('WpProfileRelations', {
      fields: ['wpsessionId'],
      type: 'foreign key',
      references: {
        table: 'WpSessions',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('WpProfileRelations');
  }
};