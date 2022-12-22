const statusModel = require("../models").Status;

const history = require('./HistoricoController');
const wpsession = require('../models/').WpSession;
const chatstatusrelation = require('../models').ClientstatusRelation;

/**
 * Controlador para manejar los datos de las sesiones de wp
 * servicios web
 */
module.exports = {

    /**
     * Obtiene los estatus actuales
     * @param {*} req 
     * @param {*} res 
     */
    async get(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        

        /**
         * Busca los status, si no existen regresa un arreglo vacio
         */
        try {
            const status = await statusModel.findAll({});
            return res.status(200).send({ status: "Success", count: status.length, statusList: status });

        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'GetstatusError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },

    /**
    * Crea o actualiza un status
    * @param {*} req 
    * @param {*} res 
    */
    async add(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Obtiene los datos para crear un nuevo webhook
         * Si viene el id reemplaza los existentes
         */

        const { id, statusObj } = req.body;

        try {
            delete statusObj.id;

            if (id) {

                const updated = await statusModel.update(
                    statusObj,
                    { where: { id: id } }
                )
                arrMsg.push(`status actualizado ${updated} ${id}`);



                return res.status(200).send({ status: "Success", msg: arrMsg });
            } else {



                const newstatus = await statusModel.create(statusObj);

                arrMsg.push(`status creado ${newstatus.id}`);
                arrMsg.push(newstatus);

                return res.status(200).send({ status: "Success", msg: arrMsg });
            }



        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'CreatestatusError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
    
    /**
     * Elimina un status
     * @param {*} req 
     * @param {*} res 
     */
    async delete(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Obtiene el id del webhook
         */

        const { id } = req.body;

        try {

            if (id) {
                const statusTemp = await statusModel.findOne(
                    { where: { id: id } }
                )


                const deleted = await statusModel.destroy(
                    { where: { id: id } }
                )

                if (deleted == 1) {
                    arrMsg.push(`Estatus Eliminado ${statusTemp.name} ${deleted} ${id}`);

                    return res.status(200).send({ status: "Success", msg: arrMsg });

                } else {
                    arrMsg.push(`Error, no existe el registro`);
                    return res.status(200).send({ status: "Error", msg: arrMsg });
                }

            } else {

                arrMsg.push(`El id es requerido`);
                return res.status(200).send({ status: "Error", msg: arrMsg });
            }



        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'DeltestatusError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },

};