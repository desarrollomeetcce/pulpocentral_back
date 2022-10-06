const permission = require('../models').Permission;
const history = require('./HistoricoController');


const userModel =  require('../models').User;

module.exports = {
    /**
     * Retorna un objeto con todos los permisos
     * @param {*} req 
     * @param {*} resp 
     * @returns 
     */
    async getPermList(req,res) {
        let arrMsg = [];

        try{
            /**
             * Consulta todos los permisos
             */
            const systems = await permission.findAll();
            return res.status(200).send({status:'Success',permissions: systems});

        }catch(err){
            
            arrMsg.push('Ocurrio un error al consultar los permisos');
            arrMsg.push(err.message);
            return res.status(200).send({status:'error',msg: arrMsg});
        } 
    },
};