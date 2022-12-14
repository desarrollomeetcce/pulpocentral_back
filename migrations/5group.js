'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Groups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      userGroupId: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      sheetId: {
        allowNull: true,
        type: Sequelize.STRING
      },
      columnsStructure: {
        allowNull: true,
        type: Sequelize.STRING
      },
      membersCount:{
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
    await queryInterface.addConstraint('Groups', {
      fields: ['userGroupId'],
      type: 'foreign key',
      name: 'fkey_group_userGroupId', // optional
      references: {
        table: 'UserGroups',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },
  
  down: async (queryInterface, Sequelize) => {
   
    await queryInterface.dropTable('Groups');
  }
};