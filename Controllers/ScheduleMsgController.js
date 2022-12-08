
const msgSchedule = require('../models').MsgSchedule;
const masiveMessage = require('../models').MassiveMessage;
const messageTemplate = require('../models').MessageTemplate;
const massiveMessagesList = require('../models').MassiveMessageList;
const { Op } = require('sequelize');
const history = require('./HistoricoController');

module.exports = {

    /**
     * Regresa un lista de los mensajes programados
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async get(req, res) {
        let arrMsg = [];

        const { user } = req.body;

        try {
            /**
             * Consulta todos los mensajes programados
             * Incluye toda su relacion
             */
            const msgSchList = await msgSchedule.findAll({
                include: [
                    { model: masiveMessage },
                    { model: messageTemplate }
                ],
                where: {
                    user: user
                }
            });

            return res.status(200).send({ status: 'Success', profiles: msgSchList });

        } catch (err) {

            arrMsg.push('Ocurrio un error al consultar los perfiles');
            arrMsg.push(err.message);
            return res.status(200).send({ status: 'error', msg: arrMsg });
        }
    },
    /**
     * Agrega o actualiza un grupo
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async add(req, res) {
        let arrMsg = [];
        let historyObj = {};

        const { id, msgObject, contacts } = req.body;


        /**
         * Si el id no es nulo entonces actualiza el perfil
         * sino lo crea
         */
        if (id) {

            try {

                if (contacts?.length <= 0) {
                    arrMsg.push(`No se puede crear un grupo sin números`);
                    return res.status(200).send({ status: 'error', msg: arrMsg });
                }

                const updated = await msgSchedule.update(
                    msgObject,
                    { where: { id: id } },
                );

                /**
                * Crea un registro de cada contacto
                */
                contacts.map(async (contact) => {
                    try {

                        const updated = await massiveMessagesList.findOne({
                            where: {
                                msgMassiveId: msgObject.idMassive,
                                contact: contact.phone ? contact.phone : contact,
                                status: 'Reprogramado',
                                sendAt: msgObject.sendAt
                            }
                        })

                        if (!updated) {
                            await massiveMessagesList.create({
                                msgMassiveId: msgObject.idMassive,
                                contact: contact.phone ? contact.phone : contact,
                                status: 'Programado',
                                sendAt: msgObject.sendAt
                            });
                        }

                    } catch (err) {
                        console.log(err);
                    }
                })


                arrMsg.push(`Mensaje programado actualizado: ${id} ${updated}`);

                return res.status(200).send({ status: 'Success', msg: arrMsg, msgObject: msgObject });
            } catch (err) {
                //Registra el movimiento el la tabla userlogs
                historyObj.user = id;
                historyObj.changeType = 'MsgScehlduledCreateError';
                historyObj.description = `Err:  ${err.message}`;
                history.regHistory(historyObj);
                arrMsg.push(`Ocurrio un error al crear el mensaje programado`);
                arrMsg.push(err.message);

                return res.status(200).send({ status: 'error', msg: arrMsg });
            }
        } else {
            try {
                const created = await msgSchedule.create(msgObject);

                /**
                 * Crea un registro de cada contacto
                 */

                contacts.map(async (contact) => {
                    try {

                        const updated = await massiveMessagesList.findOne({
                            where: {
                                msgMassiveId: msgObject.idMassive,
                                contact: contact.phone ? contact.phone : contact,
                                status: 'Reprogramado',
                                sendAt: msgObject.sendAt
                            }
                        })

                        if (!updated) {
                            await massiveMessagesList.create({
                                msgMassiveId: msgObject.idMassive,
                                contact: contact.phone ? contact.phone : contact,
                                status: 'Programado',
                                sendAt: msgObject.sendAt
                            });
                        }

                    } catch (err) {
                        console.log(err);
                    }
                })

                return res.status(200).send({ status: 'Success', msg: arrMsg, msgObject: created });
            } catch (err) {
                //Registra el movimiento el la tabla userlogs
                historyObj.user = id;
                historyObj.changeType = 'MsgScehlduledCreateError';
                historyObj.description = `Err:  ${err.message}`;
                history.regHistory(historyObj);
                arrMsg.push(`Ocurrio un error al crear el mensaje programado`);
                arrMsg.push(err.message);

                return res.status(200).send({ status: 'error', msg: arrMsg });
            }
        }
    },
    /**
     * Fucnion para eliminar el mensaje programado por id
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async delete(req, res) {
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

                const deleted = await msgSchedule.destroy({
                    where: {
                        id: id
                    }
                })
                /**
                 * Si lo eliminó manda un mensaje de success
                 */
                if (deleted) {
                    arrMsg.push(`Se eliminó correctamente el mensaje programado ${id}`);

                    historyObj.user = id;
                    historyObj.changeType = 'MsgSchDelSuccess';
                    historyObj.description = `Mensaje programado eliminado ${id}`;
                    history.regHistory(historyObj);

                    return res.status(200).send({ status: 'Success', msg: arrMsg });
                } else {
                    arrMsg.push(`No existe mensaje para eliminar`);
                    return res.status(200).send({ status: 'error', msg: arrMsg });
                }
            } catch (err) {
                historyObj.user = id;
                historyObj.changeType = 'ProfileDelError';
                historyObj.description = `Err:  ${err.message}`;
                history.regHistory(historyObj);

                arrMsg.push(`Ocurrio un error al eliminar el mensaje programado`);
                arrMsg.push(err.message);

                return res.status(200).send({ status: 'error', msg: arrMsg });
            }
        } else {
            arrMsg.push(`El id es requerido`);
            return res.status(200).send({ status: 'error', msg: arrMsg });
        }
    },
    /**
     * Regresa un lista de los mensajes programados
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async getProgramatedMsgs(dateIni, dateEnd) {
        let arrMsg = [];

        try {
            /**
             * Consulta todos los mensajes programados
             */
            const msgSchList =  await msgSchedule.findAll({
               
                where: {
                   
                    status: 'Programado',
                    sendAt: {
                        [Op.between]: [dateIni, dateEnd]
                    },
                },
                include: [
                    { model: masiveMessage },
  
                ]
            });
         
           await Promise.all( msgSchList.map(async (msgSh)=>{
                /**
                 * Buscamos la lista de cada uno de los mensajes/llamadas programados
                 */
                const conatcts = await massiveMessagesList.findAll({
                    where: {
                        msgMassiveId: msgSh.dataValues.idMassive,
                    }
                })

                let contactsArr = [];

                conatcts.map((contact)=>{
                    contactsArr.push(contact.contact);
                });
                msgSh.dataValues.contacts = contactsArr
                return true;
            }))


            return msgSchList;

        } catch (err) {
            console.log(err);
           console.log("Ocurrio un error al consultar los mensajes programados");
            return [];
        }
    },
     /**
     * Fucnion para eliminar el mensaje programado por id
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
      async updateStatus(id,status) {
        /**
        * Variables para guardar los mensaje y el historial
        */
        let arrMsg = [];
        let historyObj = {};


        if (id) {
            try {

                const updated = await msgSchedule.update({status:status},{
                    where: {
                        id: id
                    }
                })
                return null;
            } catch (err) {
                historyObj.user = id;
                historyObj.changeType = 'ProfileDelError';
                historyObj.description = `Err:  ${err.message}`;
                history.regHistory(historyObj);

                arrMsg.push(`Ocurrio un error al eliminar el mensaje programado`);
                arrMsg.push(err.message);

                return null;
            }
        } else {
            arrMsg.push(`El id es requerido`);
            return null;
        }
    },
};