'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserAuths', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      refresh_token: {
        type: Sequelize.STRING
      },
      client_secret: {
        type: Sequelize.STRING
      },
      client_id: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      idUser: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue:  1
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
    await queryInterface.addConstraint('UserAuths', {
      fields: ['idUser'],
      type: 'foreign key',
      name: 'fkey_userauths_users', // optional
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
   
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("UserAuths", "fkey_userauths_users")
    await queryInterface.dropTable('UserAuths');
  }
};