'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MassiveMessageList', {
     
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      msgMassiveId: {
        type: Sequelize.INTEGER
      },
      contact: {
        type: Sequelize.STRING
      }, 
      status: {
        type: Sequelize.STRING
      },  
      twilioStatus: {
        type: Sequelize.STRING
      },
      duration: {
        type: Sequelize.STRING
      },
      sendAt: {
        type: Sequelize.DATE
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
    })
    await queryInterface.addConstraint('MassiveMessageList', {
      fields: ['msgMassiveId'],
      type: 'foreign key',
      name: 'fkey_massivemessage_massivemessagelist', // optional
      references: {
        table: 'MassiveMessages',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MassiveMessageList');
  }
};