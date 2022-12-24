'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      profile: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue:  1
      },
      userGroupId: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      password: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING,
        defaultValue:  "Desconectado"
      },
      authToken: {
        type: Sequelize.STRING,
      },
      socketId: {
        type: Sequelize.STRING,
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
    await queryInterface.addConstraint('Users', {
      fields: ['profile'],
      type: 'foreign key',
      name: 'fkey_user_profile', // optional
      references: {
        table: 'Profiles',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('Users', {
      fields: ['userGroupId'],
      type: 'foreign key',
      name: 'fkey_user_userGroupId', // optional
      references: {
        table: 'UserGroups',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
   
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("Users", "fkey_user_profile")
    await queryInterface.removeConstraint("Users", "fkey_user_userGroupId")
    await queryInterface.dropTable('Users');
  }
};