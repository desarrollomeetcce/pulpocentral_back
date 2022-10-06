const chatModel = require('../models').Chat;
const messageModel = require('../models').Message;
const wpsession = require('../models').WpSession;
const tagsModel = require('../models').Tag;


const history = require('./HistoricoController');
const sesiones = require('../Controllers/TestController')

module.exports = {

    /**
     * Consulta todos los mensajes de un chat
     * @param {*} req 
     * @param {*} res 
     */
    async getChats(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        const { sessions } = req.body;



        /**
         * Busca las sessiones, si no existen regresa un arreglo vacio
         */
        try {
            const chats = await chatModel.findAll(
                {
                    where: {
                        wpSessionId: sessions ? sessions : []
                    },
                    include: [
                        {
                            model: messageModel,
                            attributes: ['id', 'wpId', 'chatId', 'body', 'mediaUrl', 'fromMe', 'timestamp'],
                        },
                        {
                            model: wpsession,
                            attributes: ['id', 'sessionAuth','color'],
                        },
                        {
                            model: tagsModel,
                            attributes: ['id', 'name'],
                            through: { attributes: [] }
                        }
                    ],
                    order: [
                        ['timestamp', 'DESC'],
                        [messageModel, 'timestamp', 'ASC'],

                    ],
                }
            );
            return res.status(200).send({ status: "Success", count: chats.length, chats: chats });

        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'GetChatsError';
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
    async getContact(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        const { sessions } = req.body;



        /**
         * Busca las sessiones, si no existen regresa un arreglo vacio
         */
        try {
            const contactsTemp = await chatModel.findAll(
                {
                    where: {
                        wpSessionId: sessions ? sessions : []
                    },
                    attributes: ['id', 'name', 'phone'],
                    include: [
                        {
                            model: tagsModel,
                            attributes: ['id', 'name'],
                            through: { attributes: [] }
                        },
                        {
                            model: wpsession,
                            attributes: ['id', 'sessionAuth','color'],
                        },
                    ],
                    
                }
            );
            const contacts = [];
            contactsTemp.map((cont,key)=>{

               
                let newC = {
                    id: cont.id,
                    name: cont.name,
                    phone: cont.phone
                }

                let tags = cont.Tags.map((tag,key)=>{
                    return tag.name
                })

                newC.Tags = tags.toString();
                newC.WpSession = cont.WpSession;
                newC.whats = cont.WpSession.sessionAuth;
                contacts.push(newC);
            })
            return res.status(200).send({ status: "Success", count: contacts.length, contacts: contacts });

        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'GetCOnatctsError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);


            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
    /**
     * Fija un chat en el top
     * @param {*} req 
     * @param {*} res 
     */
    async pinChat(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        const { sessionAuth, contact, pinned,id } = req.body;

        try {
            /**
            * Si la sesion no esta vacia
            */
            if (sessionAuth) {
                const clientTemp = sesiones.getSessionById(sessionAuth);
                const client = clientTemp[0];

                const chat = await client.getChatById(`${contact}@c.us`);
                console.log(pinned);
                if (pinned || pinned == 1) {
                    const isPinned = await chat.unpin();
                    const localPinned = await chatModel.update({pinned: 0},{where:{id: id}})
                    if (localPinned) {
                        return res.status(200).send({ status: "Success", chat: contact });

                    } else {

                        return res.status(200).send({ status: "Error", chat: contact });
                    }
                } else {
                    const isPinned = await chat.pin();
                    const localPinned = await chatModel.update({pinned: 1},{where:{id: id}})

                    if (localPinned) {
                        return res.status(200).send({ status: "Success", chat: contact });

                    } else {

                        return res.status(200).send({ status: "Error", chat: contact });
                    }
                }

            }else{
                return res.status(200).send({ status: "Error", chat: contact });
            }


        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'PinChatErr';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);


            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });

        }



    }
};