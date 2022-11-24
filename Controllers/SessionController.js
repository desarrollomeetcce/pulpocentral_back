const wpsession = require("../models").WpSession;
const history = require('./HistoricoController');
let socketObjs = require('./ClientSocketsController');
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
const sesiones = require('../Controllers/TestController')
const wpsessionController = require('./WpSessionController');
const { Console } = require("console");


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Controlador para manejar los datos de las sesiones de wp
 * servicios web
 */
module.exports = {

    /**
     * Obtiene las sesiones actuales
     * @param {*} req 
     * @param {*} res 
     */
    async getSessionsService(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        const { wpSessions } = req.body;

        let filter = {}

        const ss = sesiones.getSessions();
        //console.log(ss);
        /*
        if (wpSessions) {
            filter = { sessionAuth: wpSessions }
        }*/
        /**
         * Busca las sessiones, si no existen regresa un arreglo vacio
         */
        try {
            const sessions = await wpsession.findAll({
                where: filter
            });
            return res.status(200).send({ status: "Success", count: sessions.length, sessions: sessions });
        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'GetSessionsError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },

    /**
    * Crea o actualiza una sesion
    * @param {*} req 
    * @param {*} res 
    */
    async addSession(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Obtiene los datos para crear una nueva sesion
         * Si viene el id reemplaza los existentes
         */

        const { id, wpsessionObj } = req.body;

        if(wpsessionObj?.sessionAuth){
            wpsessionObj.sessionAuth =   wpsessionObj?.sessionAuth.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '-');
        }
       

        try {
            delete wpsessionObj.id;

            if (id) {

                const updated = await wpsession.update(
                    wpsessionObj,
                    { where: { id: id } }
                )
                arrMsg.push(`Wp actualizado ${updated} ${id}`);



                return res.status(200).send({ status: "Success", msg: arrMsg });
            } else {
                const newSession = await wpsession.create(wpsessionObj);

                console.log(newSession.name);

                const newC = await wpsessionController.createClientV2(newSession.id, newSession.sessionAuth, newSession.status);
                wpsessionController.initClientV2(newC, newSession.sessionAuth, newSession.id);
                sesiones.addSession(newC);


                arrMsg.push(`Wp creado ${newSession.id}`);
                arrMsg.push(newSession);
                //  getWbot(wpsessionObj.sessionAuth);
                //console.log(socketObjs);
                return res.status(200).send({ status: "Success", msg: arrMsg });
            }



        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'CreateSessionError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
    /**
    * Reconecta una sesion
    * @param {*} req 
    * @param {*} res 
    */
     async reconnectSession(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        /**
         *Obtiene el cliente para inicializarlo
         *
         */

        const {sessionAuth } = req.body;

        try {
           

            const clientArr = sesiones.getSessionById(sessionAuth);
            const client = clientArr[0];

            client.initialize();
            return res.status(200).send({ status: "Success", msg: arrMsg });
        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'InitSessionError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
    /**
     * Elimina una sesion
     * @param {*} req 
     * @param {*} res 
     */
    async deleteSession(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Obtiene el id de la sesion
         */

        const { id } = req.body;

        try {

            if (id) {
                const sessionTemp = await wpsession.findOne(
                    { where: { id: id } }
                )

                try {
                    const client = sesiones.getSessionById(sessionTemp.sessionAuth);
                    // console.log(client);
                    //
                     console.log(client[0]);
                    if (client[0].getState() == 'CONNECTED') {

                       // client[0].logout();
                    }
                    try {
                        await client[0].logout();
                    } catch (err) {
                        console.log(err);
                    }
                    try {
                       // await client[0].destroy();
                    } catch (err) {
                        console.log(err);
                    }
                    console.log("Cliente eliminado");
                    await sleep(5000);
                    console.log("Borrando sesion");
                    fs.rmSync(`${process.cwd()}/.wwebjs_auth/session-${sessionTemp.sessionAuth}`, { recursive: true, force: true });
                    // await client[0].destroy();

                } catch (err) {
                    console.log(err)
                }
                const deleted = await wpsession.destroy(
                    { where: { id: id } }
                )

                if (deleted == 1) {
                    arrMsg.push(`Wp Eliminado ${sessionTemp.sessionAuth} ${deleted} ${id}`);
                    arrMsg.push(`${process.cwd()}\\.wwebjs_auth\\session-${sessionTemp.sessionAuth}`);

                   // console.log(`${process.cwd()}\\.wwebjs_auth\\session-${sessionTemp.sessionAuth}`);

                    // socket.sockets.emit('restart')
                  // fs.rmSync(`${process.cwd()}/.wwebjs_auth/session-${sessionTemp.sessionAuth}`, { recursive: true, force: true });
                    // getSessions();
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
            historyObj.changeType = 'CreateSessionError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    }

};