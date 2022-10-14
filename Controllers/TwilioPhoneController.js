
const twilioModel = require('../models/').TwilioPhone;
const history = require('./HistoricoController');

/**
 * Controlador para manejar los datos de clientes 
 * servicios web
 */
module.exports = {

    async create(req, res) {

        /**
        * Variables para guardar los mensaje y el historial
        */
        let arrMsg = [];
        let historyObj = {};

        const { id, twilioPhone } = req.body;

        try {
            if (id) {
                await twilioModel.update(twilioPhone, { where: { id: id } });
                return res.status(200).send({ status: "Success" });
            } else {
                const newPhone = await twilioModel.create(twilioPhone);
                return res.status(200).send({ status: "Success", twilioPhone: newPhone });
            }

        } catch (err) {
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'CreateTwilioPhoneError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(`El password es requerido`);
            arrMsg.push(err.message);

            console.log(err);

            return res.status(200).send({ status: "Error", err: err });
        }
    },
    async getPhones(req, res) {

        /**
        * Variables para guardar los mensaje y el historial
        */
        let arrMsg = [];
        let historyObj = {};

        try {

            const twilioPhones = await twilioModel.findAll();

            return res.status(200).send({ status: "Success", twilioPhones: twilioPhones });


        } catch (err) {
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'FindAllTwilioPhonesError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(`El password es requerido`);
            arrMsg.push(err.message);

            console.log(err);

            return res.status(200).send({ status: "Error", err: err });
        }
    },

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
              
                const deleted = await twilioModel.destroy(
                    { where: { id: id } }
                )

                if (deleted == 1) {
                    arrMsg.push(`Telefono Eliminado ${deleted} ${id}`);

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
            historyObj.changeType = 'DelteTwilioPhoneError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
};