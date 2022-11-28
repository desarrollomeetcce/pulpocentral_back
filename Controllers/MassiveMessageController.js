const massivemessages = require('../models').MassiveMessage;
const massivemessagelist = require('../models').MassiveMessageList;
const msgwordrelation = require('../models').MsgWordRelation;
const msgfilerelation = require("../models").MsgFileRelation;

const history = require('./HistoricoController');
const { Op } = require('sequelize');
module.exports = {

    /**
     * Agrega la relacion de archivos y el envio masivo
     * @param {*} req 
     * @param {*} res 
     */
    async addMsgFiles(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        const { id, files } = req.body;

        /**
         * Agrega todos los archivos en la tabal de files
         */

        try {


            let filesArr = [];

            await Promise.all(files.map(async (fileId, key) => {
                try {

                    await msgfilerelation.create({ massiveMessageId: id, fileId: fileId });
                    return true;
                } catch (err) {
                    console.log(err);
                    return false;
                }
            }))

            // console.log(files);
            return res.status(200).send({ status: "Success", count: filesArr.length, files: filesArr });
        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'AddFileMsgError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },

    /**
    * Elimina la relacion de archivos y el mensaje masivo
    * @param {*} req 
    * @param {*} res 
    */
    async removeMsgFiles(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        const { id, files } = req.body;

        /**
         * Elimina los archivos del webhook
         */

        try {


            let filesArr = [];

            await Promise.all(files.map(async (fileId, key) => {
                try {

                    await msgfilerelation.destroy({ where: { massiveMessageId: id, fileId: fileId } });
                    return true;
                } catch (err) {
                    console.log(err);
                    return false;
                }
            }))

            // console.log(files);
            return res.status(200).send({ status: "Success", count: filesArr.length, files: filesArr });
        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'RemoveFileMsgError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
    /**
     * Consulta todos los mensajes de un chat
     * @param {*} req 
     * @param {*} res 
     */
    async getMassive(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        const { sessions, forwardingId, kind,userId } = req.body;


        const filter ={
           
            forwardingId: forwardingId ? forwardingId : 0,
            
        }

        if(!forwardingId){
            filter.kind = kind ? kind : null;
        }

        if(sessions){
            filter.wpId= sessions ? sessions : [];
        }
        if(userId){
            filter.userSend = userId;
        }
        /**
         * Busca las sessiones, si no existen regresa un arreglo vacio
         */
        try {
            const messages = await massivemessages.findAll(
                {
                    where: filter,
                    include: [
                        {
                            model: massivemessagelist,
                            attributes: ['id', 'contact', 'msgMassiveId', 'status','sendAt', 'updatedAt', 'createdAt'],
                        },
                    ],
                    order: [
                        ['updatedAt', 'DESC'],

                    ],
                }
            );
            return res.status(200).send({ status: "Success", count: messages.length, messages: messages });

        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'GetMassivemessagesError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);


            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
    /**
     * Consulta todos los grupos de envio
     * @param {*} req 
     * @param {*} res 
     */
     async getMassiveLite(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        const { sessions, forwardingId, kind } = req.body;



        /**
         * Busca las sessiones, si no existen regresa un arreglo vacio
         */
        try {
            const groups = await massivemessages.findAll(
                {
                    where: {
                        wpId: sessions ? sessions : [],
                        forwardingId: forwardingId ? forwardingId : 0,
                        kind: kind ? kind : null,
                    },
                    order: [
                        ['updatedAt', 'DESC'],

                    ],
                }
            );
            return res.status(200).send({ status: "Success", count: groups.length, groups: groups });

        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'GetMassivemessagesError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);


            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
     /**
     * Consulta todos los grupos de envio
     * @param {*} req 
     * @param {*} res 
     */
      async getMassiveMessagesLite(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        const { id,dIni,dEnd} = req.body;



        /**
         * Busca las sessiones, si no existen regresa un arreglo vacio
         */
        try {
            const messages = await massivemessagelist.findAll(
                {
                    where: {
                        msgMassiveId: id,
                        updatedAt: {
                            [Op.between]: [dIni, dEnd]
                        },
                    },
                    order: [
                        ['updatedAt', 'DESC'],

                    ],
                }
            );
            return res.status(200).send({ status: "Success", count: messages.length, messages: messages });

        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'GetMassivemessagesError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);


            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
    /**
   * Crea o actualiza un grupo de envio massivo
   * @param {*} req 
   * @param {*} res 
   */
    async addMassive(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Obtiene los datos para crear un nuevo grupo de mensajes
         * Si viene el id reemplaza los existentes
         */

        const { id, messageObj, words } = req.body;


        try {
            delete messageObj.id;

            messageObj.wpId = messageObj.wpId.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '-');

            if (id) {

                const updated = await massivemessages.update(
                    messageObj,
                    { where: { id: id } }
                )
                arrMsg.push(`Mensaje masivo actualizado ${updated} ${id}`);


                await msgwordrelation.destroy({ where: { massiveId: id } });

                if (updated) {
                    words?.map(async (word, key) => {
                        await msgwordrelation.create({ massiveId: id, wordId: word });
                    })

                    return res.status(200).send({ status: "Success", msg: arrMsg });
                } else {
                    arrMsg.push(`El grupo no exitste`);
                    return res.status(200).send({ status: "Error", msg: arrMsg });
                }



            } else {

                let newMsgListTemp = { ...messageObj }



                const newMsgList = await massivemessages.create(newMsgListTemp);

                arrMsg.push(`Lista creada creado ${newMsgList.id}`);
                arrMsg.push(newMsgList);

                words?.map(async (word, key) => {
                    await msgwordrelation.create({ massiveMessageId: newMsgList.id, wordId: word });
                })

                return res.status(200).send({ status: "Success", msg: arrMsg, msgObj: newMsgList });
            }



        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'CreateMsgListError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);
            console.log(err);
            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
    /**
    * Consulta todos los mensajes de un chat
    * @param {*} req 
    * @param {*} res 
    */
    async getPendingList(req) {

        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        
        const { dateIni, dateEnd, status } = req;

        /**
         * Busca las sessiones, si no existen regresa un arreglo vacio
         */
        try {
            const messages = await massivemessagelist.findAll(
                {
                    where: {
                        sendAt: {
                            [Op.between]: [dateIni, dateEnd]
                        },
                        status: status
                    },
                }
            );

            return messages;
        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'GetCronMsgListError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);


            arrMsg.push(err.message);

            return [];
        }
    },
    /**
     * Fucnion para eliminar el perfil por id
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
     async deleteProfile(req, res) {
        /**
        * Variables para guardar los mensaje y el historial
        */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Revisamos si contiene un id
         */
        const { id } = req.body;

        if (id) {
            try {
                const deletedMessage = await massivemessages.destroy({
                    where: {
                        id: id
                    }
                })
                arrMsg.push(`Se eliminó el id ${id}`);
                arrMsg.push(deletedMessage);
                return res.status(200).send({ status: 'Success', msg: arrMsg });
            } catch (err) {
                historyObj.user = id;
                historyObj.changeType = 'MassiveDelError';
                historyObj.description = `Err:  ${err.message}`;
                history.regHistory(historyObj);

                arrMsg.push(`Ocurrio un error al eliminar el grupo de bitacora`);
                arrMsg.push(err.message);

                return res.status(200).send({ status: 'Error', msg: arrMsg });
            }
        } else {
            arrMsg.push(`El id es requerido`);
            return res.status(200).send({ status: 'Error', msg: arrMsg });
        }
    },

    /**
     * Fucnion para actualizar el nombre del grupo 
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
     async updateGroup(req, res) {
        /**
        * Variables para guardar los mensaje y el historial
        */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Revisamos si contiene un id
         */
        const { id,name} = req.body;

        if (id) {
            try {
                const deletedMessage = await massivemessages.update({name: name},{
                    where: {
                        id: id
                    }
                })
                arrMsg.push(`Se actualizó el id ${id}`);
                arrMsg.push(deletedMessage);
                return res.status(200).send({ status: 'Success', msg: arrMsg });
            } catch (err) {
                historyObj.user = id;
                historyObj.changeType = 'MassiveUpdateError';
                historyObj.description = `Err:  ${err.message}`;
                history.regHistory(historyObj);

                arrMsg.push(`Ocurrio un error al actualizar el grupo de bitacora`);
                arrMsg.push(err.message);

                return res.status(200).send({ status: 'Error', msg: arrMsg });
            }
        } else {
            arrMsg.push(`El id es requerido`);
            return res.status(200).send({ status: 'Error', msg: arrMsg });
        }
    }

};