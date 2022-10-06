'use strict';


module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Permissions', [
      {
        name: 'Modificar Usuarios',
        description: "Permiso para la modificación de usuarios",
      },
      {
        name: 'Eliminar Usuarios',
        description: "Permiso para la eliminar de usuarios",
      },
      {
        name: 'Agregar Usuarios',
        description: "Permiso para registrar usuarios",
      },
      {
        name:'Eliminar Perfil',
        description:'Permiso para eliminar perfiles'
      },
      {
        name:'Agregar Perfil',
        description:'Permiso para modificar permisos en los diferentes perfiles'
      },
      {
        name:'Modificar Perfil',
        description:'Permiso para modificar permisos en los diferentes perfiles'
      },
      {
        name:'Agregar Whatsapp',
        description:'Permiso para agregar una nueva sesión'
      },
      {
        name:'Eliminar Whatsapp',
        description:'Permiso elimiminar una sesión'
      },
      {
        name:'Bitacora Envio Masivo',
        description:'Permite entrar a la bitacora del envio masivo'
      },
      {
        name:'Eliminar Sesion',
        description:'Permite eliminar una sesion'
      },
      {
        name:'Agregar Sesion',
        description:'Permite Agregar una sesion'
      },
      {
        name:'Eliminar Speech',
        description:'Permite eliminar un speech'
      },
      {
        name:'Agregar Speech',
        description:'Permite Agregar una Speech'
      },
      {
        name:'Eliminar Plantilla',
        description:'Permite eliminar una Plantilla'
      },
      {
        name:'Agregar Plantilla',
        description:'Permite Agregar una Plantilla'
      },
      {
        name:'Eliminar categorias',
        description:'Permite eliminar un Tag'
      },
      {
        name:'Agregar categorias',
        description:'Permite Agregar un Tag'
      },
      {
        name:'Modificar categorias',
        description:'Permite Agregar un Tag'
      },
      {
        name:'Atender clientes',
        description:'Permiso para los usuarios que darán seguimiento a los clientes'
      },
      {
        name:'Crear Grupo',
        description:'Permite Agregar un grupo'
      },
      {
        name:'Eliminar Grupo',
        description:'Permite eliminar un grupo'
      },
      {
        name:'Modificar Grupo',
        description:'Permite Modificar un grupo'
      },
      {
        name:'Asignar Clientes',
        description:'Permite Asignar clientes a usuarios'
      },
      
      
      
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Permissions', null, {});
  }
};
