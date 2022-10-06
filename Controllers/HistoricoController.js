const history = require('../models').UserLog;

module.exports = {

    async regHistory(historyObj) {
        let arrMsg = [];

        try{
            /**
             * Guardamos el historico del movimiento
             */
            //console.log(historyObj);
            await history.create(historyObj);
            return arrMsg.push("Registro de historico correcto");
        }catch(err){
            arrMsg.push("Ocurrio un error inesperado");
            arrMsg.push(err.message);
           // console.log(err);
            return arrMsg;
        } 
    }
};