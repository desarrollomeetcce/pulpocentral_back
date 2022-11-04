'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TwilioProfileRelations', {
   
      profileId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      twilioPhoneId: {
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
    await queryInterface.addConstraint('TwilioProfileRelations', {
      fields: ['profileId'],
      type: 'foreign key',
      references: {
        table: 'Profiles',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
    await queryInterface.addConstraint('TwilioProfileRelations', {
      fields: ['twilioPhoneId'],
      type: 'foreign key',
      references: {
        table: 'TwilioPhones',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TwilioProfileRelations');
  }
};