'use strict';


module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Profiles', [{
      
        name: 'Perfil Default',
        description: "Perfil por default asignado a los usuarios sin perfil",
      },
      {
      
        name: 'Administrador',
        description: "Perfil con todos los accesos",
      }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Profiles', null, {});
  }
};