const user = require('../models').User;
const permission= require('../models').Permission
const profile= require('../models').Profile
const bcrypt = require('bcrypt');
const history = require('./HistoricoController');

/**
 * Valida si el usuario contiene los campos necesarios
 * Esta pediente su implementacion
 * @param {*} user 
 */
const validaUsuario = (user) =>{

}

module.exports = {
   /**
    * Devuelve una lista con todos los usuarios 
    * @param {*} req 
    * @param {*} res 
    */
    async  getusers (req,res){
       /**
        * consulta todos los usuarios en la base de datos 
        */
        const usuarios =  await user.findAll();
        //console.log(usuarios)
        return res.status(200).send(usuarios);
   },
   /**
    * Inserta un usuario o lo actualiza
    * @param {*} req 
    * @param {*} res 
    */
   async adduser(req,res){
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};
       /**
        * Revisamos si contiene un id
        */
        const {id,userObj} = req.body;
        if(userObj?.password){
            try{
                /**
                 * Encripta el password para almacenarlo
                 */
                 userObj.password =  bcrypt.hashSync(userObj.password, 10);
            }catch(err){
                  //Registra el movimiento el la tabla userlogs
                  historyObj.user = id;
                  historyObj.changeType = 'UserCreateError';
                  historyObj.description = `Err:  ${err.message}`;
                  history.regHistory(historyObj);
    
                  arrMsg.push(`El password es requerido`);
                  arrMsg.push(err.message);
    
                  return res.status(200).send({status:'Error',msg:arrMsg});
            }
        }
       
       

        /**
         * Si el id no es nulo entonces actualiza el usuario
         * sino lo crea
         */
        if(id){

            try{
                const userUpdated = await user.update( 
                    userObj,
                    { where: { email: id } }
                );
                /**
                 * Valida si se actualizó
                 */
                if(userUpdated == 1){
                    arrMsg.push(`Se actualizó el usuario correctamente`);

                    //Registra el movimiento el la tabla userlogs
                    historyObj.user = id;
                    historyObj.changeType = 'UserUpdateSuccess';
                    historyObj.description = `Usuario actualizado ${id}`;
                    history.regHistory(historyObj);
    
                    return res.status(200).send({status:'Success',msg:arrMsg,user: userObj});
                }else{
                    arrMsg.push(`No existe el usuario ${id}`);
                    return res.status(200).send({status:'Error',msg:arrMsg});
                }
               
            }catch(err){
                //Registra el movimiento el la tabla userlogs
                historyObj.user = id;
                historyObj.changeType = 'UserUpdateError';
                historyObj.description = `Err:  ${err.message}`;

                arrMsg.push(`Ocurrio un Error al actualizar el usuario`);
                arrMsg.push(err.message);

                return res.status(200).send({status:'Error',msg:arrMsg});
            }
            
        }else{  
            try{
                const userCreated = await user.create(userObj);

                //Registra el movimiento el la tabla userlogs
                historyObj.user = id;
                historyObj.changeType = 'UserCreateSuccess';
                historyObj.description = `Usuario creado ${id}`;
                history.regHistory(historyObj);

                arrMsg.push(`Se creo el usuario correctamente`);

                return res.status(200).send({status:'Success',msg:arrMsg,user: userCreated});
            }catch(err){
                 //Registra el movimiento el la tabla userlogs
                historyObj.user = id;
                historyObj.changeType = 'UserCreateError';
                historyObj.description = `Err:  ${err.message}`;
                history.regHistory(historyObj);

                arrMsg.push(`Ocurrio un Error al crear el usuario`);
                arrMsg.push(err.message);

                return res.status(200).send({status:'Error',msg:arrMsg});
            }
        }
   },
   /**
    * Elimina un usuario por id
    * @param {*} req 
    * @param {*} res 
    */
   async  deleteUser(req,res){
        /**
        * Variables para guardar los mensaje y el historial
        */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Revisamos si contiene un id
         */
        const {email} = req.body;

        if(email){
            try{
                const userDel = await user.destroy({
                    where: {
                        email:email
                    }
                })
                /**
                 * Si lo eliminó manda un mensaje de Success
                 */
                if(userDel){
                    arrMsg.push(`Se eliminó correctamente el usuario ${email}`);

                    historyObj.user = email;
                    historyObj.changeType = 'UserDelSuccess';
                    historyObj.description = `Usuario eliminado ${email}`;
                    history.regHistory(historyObj);

                    return res.status(200).send({status:'Success',msg:arrMsg});
                }else{
                    arrMsg.push(`No existe usuario para eliminar`);
                    return res.status(200).send({status:'Error',msg:arrMsg});
                }
            }catch(err){
                historyObj.user = email;
                historyObj.changeType = 'UserDelError';
                historyObj.description = `Err:  ${err.message}`;
                history.regHistory(historyObj);

                arrMsg.push(`Ocurrio un Error al eliminar el usuario`);
                arrMsg.push(err.message);

                return res.status(200).send({status:'Error',msg:arrMsg});
            }
        }else{
            arrMsg.push(`El id es requerido`);
            return res.status(200).send({status:'Error',msg:arrMsg});
        }
   }
    
};