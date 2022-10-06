'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Clients', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      country: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      gender: {
        type: Sequelize.STRING
      },
      level: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      adviser: {
        type: Sequelize.INTEGER
      },
      groupId:{
        type: Sequelize.INTEGER
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
    await queryInterface.addConstraint('Clients', {
      fields: ['groupId'],
      type: 'foreign key',
      references: {
        table: 'Groups',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
    await queryInterface.addConstraint('Clients', {
      fields: ['adviser'],
      type: 'foreign key',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
   
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("Clients", "fkey_user_profile")
    await queryInterface.dropTable('Clients');
  }
};