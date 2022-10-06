const wordModel = require("../models").Word;


const history = require('./HistoricoController');

/**
 * Controlador para manejar los datos de las sesiones de wp
 * servicios web
 */
module.exports = {

    /**
     * Obtiene las listas de sistituciones de palabras
     * @param {*} req 
     * @param {*} res 
     */
    async getWords(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        const { wpSessions } = req.body;

        let filter = {}

        /**
         * Busca la relacion de palabras, si no existen regresa un arreglo vacio
         */
        try {
            const words = await wordModel.findAll({
                where: filter,
            });

            return res.status(200).send({ status: "Success", count: words.length, words: words });
        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'GeWordsError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },

    /**
    * Crea o actualiza una palabra
    * @param {*} req 
    * @param {*} res 
    */
    async addWord(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Obtiene los datos para crear una nueva relacion de palabras
         * Si viene el id reemplaza los existentes
         */

        const { id, wordObj } = req.body;

        try {
            delete wordObj.id;

            if (id) {

                const updated = await wordModel.update(
                    wordObj,
                    { where: { id: id } }
                )
                arrMsg.push(`Speech actualizado ${updated} ${id}`);

                if (updated) {
                    return res.status(200).send({ status: "Success", msg: arrMsg });
                } else {
                    arrMsg.push(`El Speech no exitste`);
                    return res.status(200).send({ status: "Error", msg: arrMsg });
                }



            } else {

                let newWordTemp = { ...wordObj }

                const newWebhook = await wordModel.create(newWordTemp);

                arrMsg.push(`Speech creado ${newWebhook.id}`);
                arrMsg.push(newWebhook);

                return res.status(200).send({ status: "Success", msg: arrMsg });
            }



        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'CreateSpeechkError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);
            console.log(err);
            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
    /**
     * Elimina una relacion de palabras
     * @param {*} req 
     * @param {*} res 
     */
    async deletWord(req, res) {
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
                const wordTemp = await wordModel.findOne(
                    { where: { id: id } }
                )


                const deleted = await wordModel.destroy(
                    { where: { id: id } }
                )

                if (deleted == 1) {
                    arrMsg.push(`Speech Eliminado ${wordTemp.name} ${deleted} ${id}`);

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
            historyObj.changeType = 'DelteSpeechError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },

    
};