'use strict';


module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('PermProfileRelations', [
      {
        profileId: 2,
        permissionId: 1,
      },
      {
        profileId: 2,
        permissionId: 2,
      },
      {
        profileId: 2,
        permissionId: 3,
      },
      {
        profileId: 2,
        permissionId: 4,
      },
      {
        profileId: 2,
        permissionId: 5,
      },
      {
        profileId: 2,
        permissionId: 6,
      },
      {
        profileId: 2,
        permissionId: 7,
      },
      {
        profileId: 2,
        permissionId: 8,
      },
      {
        profileId: 2,
        permissionId: 9,
      },
      {
        profileId: 2,
        permissionId: 10,
      },
      {
        profileId: 2,
        permissionId: 11,
      },
      {
        profileId: 2,
        permissionId: 12,
      },
      {
        profileId: 2,
        permissionId: 13,
      },
      {
        profileId: 2,
        permissionId: 14,
      },
      {
        profileId: 2,
        permissionId: 15,
      },
      {
        profileId: 2,
        permissionId: 16,
      },
      {
        profileId: 2,
        permissionId: 17,
      },
      {
        profileId: 2,
        permissionId: 18,
      },
     
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('PermProfileRelations', null, {});
  }
};