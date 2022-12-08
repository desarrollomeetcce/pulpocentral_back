/**
 * Modelos de datos para el envio masivo
 */

const massiveMessages = require('../models').MassiveMessage;
const massiveMessagesList = require('../models').MassiveMessageList;
const sessions = require('../Controllers/TestController');
const { MessageMedia } = require('whatsapp-web.js');
const webhookModel = require("../models").WebHook;
const webhooklogModel = require("../models").WebHookLog;
const wordsModel = require("../models").Word;
const userModel = require("../models").User;

const sesiones = require('../Controllers/TestController')
const history = require('./HistoricoController');
const { Op } = require("sequelize");
const user = require('../models/user');
const filesModel = require("../models").File;


// Initialize a Twilio client
const clientTwilio = require('twilio')(process.env.TWILIO_API_KEY, process.env.TWILIO_API_SECRET, {
    accountSid: process.env.TWILIO_ACCOUNTDIS
});
//const clientTwilio = require('twilio')(process.env.TWILIO_ACCOUNTDIS, process.env.TWILIO_AUTH_TOKEN);

let io;

const sednMessge = async (msgObj) => {

    const { id, contacts, wpsession } = msgObj;

    //console.log("Mensaje socket");
    //console.log(msgObj)

    /** Un retarno en caso de necesitar que no se envien seguidos */
    // const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /** Recupera el cliente */
    let clientTemp = sessions.getSessionById(wpsession);
    let client = clientTemp[0]

    let messageHisotiral = null;
    try {
        //console.log("Consulta historial");
        messageHisotiral = await massiveMessages.findOne({
            where: {
                id: id
            },
            include: [

                {
                    model: wordsModel,
                },
                {
                    model: filesModel,
                },

            ],
        })

        //console.log(messageHisotiral)
    } catch (err) {
        console.log(err);
    }
    //console.log(!messageHisotiral);
    if (!messageHisotiral) {
        return;
    }

    /**
     * Crea un registro de cada contacto
     */
    contacts.map(async (contact, key) => {
        try {

            const updated = await massiveMessagesList.findOne({
                where: {
                    msgMassiveId: messageHisotiral.dataValues.id,
                    contact: contact,
                }
            })

            if (!updated) {
                await massiveMessagesList.create({
                    msgMassiveId: messageHisotiral.dataValues.id,
                    contact: contact,
                    status: 'Pendiente',
                });
            }

        } catch (err) {
            console.log(err);
        }
    })

    /**
     * Envia cada mensaje al contacto
     */

    let count = 1;

    let media = null;

    /**
     * Solo se ejecuta si no estamos en pruebas
     */
    if (!process.env.TEST) {
        if (messageHisotiral.dataValues.mediaUrl) {
            media = MessageMedia.fromFilePath('./media/' + messageHisotiral.dataValues.mediaUrl);
        }
    }

    //console.log("Crea el speech");


    for await (let contact of contacts) {

        /**
         * El speech sirve para reemplazar palabras 
         * De esta forma no es tan evidente que es un bot
         */

        let regularExpression = /(?<=\{).*?(?=\})/g;


        let newMsg = messageHisotiral.dataValues.body;


        let tempSpeechArr = newMsg.match(regularExpression);

        if (tempSpeechArr?.length > 0) {
            for (let i = 0; i < tempSpeechArr.length; i++) {
                console.log(tempSpeechArr[i]);
                const speechArr = tempSpeechArr[i].split('|');
                console.log(speechArr)
                let newIndex = count % speechArr.length;

                newMsg = newMsg.replace(`{${tempSpeechArr[i]}}`, speechArr[newIndex]);
                console.log(newMsg)
            }
        }




        // console.log(webhookTemp);
        for (let i = 0; i < messageHisotiral.dataValues.Words.length; i++) {

            // console.log(webhookTemp.dataValues.Words[i].dataValues);
            const speechArr = messageHisotiral.dataValues.Words[i]['replace'].split(',');

            let newIndex = count % speechArr.length;

            newMsg = newMsg.replace(messageHisotiral.dataValues.Words[i].dataValues.word, speechArr[newIndex]);

            //console.log(newMsg);

        }

        /**
         * Trata de enviar el mensaje 
         */
        try {

            /**
             * NOTA: revisar qué pasa si no se tiene registrado
             */

            //  console.log(`Esperando para enviar mensaje ${messageHisotiral.dataValues.delay}`)
            await sleep(messageHisotiral.dataValues.delay || 10000);

            let statusTemp = 'Error'

            if (!process.env.TEST) {
                // console.log("Envia mensaje");
                const chat = await client.getChatById(`${contact}@c.us`);

                /**
                 * Si tiene un archivo adjunto se envia
                 */


                try {
                    if (messageHisotiral.Files.length > 0) {

                        /**
                         * Si tiene archivos los envia todos
                         * Adjunta el mensaje al primero
                         */
                        await Promise.all(messageHisotiral.Files.map(async (f, k) => {

                            let mediaTemp = MessageMedia.fromFilePath('./media/' + f.path);

                            if (k == 0) {
                                if (!f.path.match(/.(jpg|jpeg|png|gif)$/i)) {
                                    await chat.sendMessage(newMsg);
                                }

                                await chat.sendMessage(mediaTemp, { caption: newMsg });
                            } else {
                                await chat.sendMessage(mediaTemp);
                            }

                            return true;
                        }))


                    } else {
                        await chat.sendMessage(newMsg);
                    }

                    statusTemp = 'Exitoso'
                } catch (err) {
                    console.log(err);
                }
            } else {
                statusTemp = 'Exitoso'
            }

            count++;
            await massiveMessages.update({ totalMessagesSend: count }, { where: { id: messageHisotiral.dataValues.id } });

            // console.log(`MSG_SUCCESS${messageHisotiral.id}`)
            io.sockets.emit(`MSG_SUCCESS${messageHisotiral.dataValues.id}`, { contact: contact, count: count });
            /**
             * Actualiza el estatus
             */
            //  console.log("Envia mensaje");
            try {
                await massiveMessagesList.update(
                    { status: statusTemp },
                    {
                        where: {
                            msgMassiveId: messageHisotiral.dataValues.id,
                            contact: contact,
                        }
                    });
                //  return true;
            } catch (err) {
                console.log(err);
                // return false
            }
        } catch (err) {
            console.log(err);

            /**
             * Actualiza el estatus
             */
            try {
                await massiveMessagesList.update(
                    { status: 'Error' },
                    {
                        where: {
                            msgMassiveId: messageHisotiral.dataValues.id,
                            contact: contact,
                        }
                    });
                //   return true;
            } catch (err) {
                console.log(err);
                // return false
            }
        }
    }


}



const sendCall = async (msgObj) => {

    let { id, contacts, from, resend, resendAll } = msgObj;

    console.log("inciia llamada " + from);
    console.log(msgObj);

    let resendText = '';

    if (resend) {
        resendText = ' (Reenviado)';
    }

    let messageHisotiral = null;
    try {
        //console.log("Consulta historial");
        messageHisotiral = await massiveMessages.findOne({
            where: {
                id: id
            },
        })

        //console.log(messageHisotiral)
    } catch (err) {
        console.log(err);
    }
    //console.log(!messageHisotiral);
    if (!messageHisotiral) {
        return;
    }

    console.log("incia map de contactos");

    if (resendAll) {
        contacts = await massiveMessagesList.findAll({
            where: {
                msgMassiveId: messageHisotiral.dataValues.id,
                status: { [Op.notLike]: '%Exitoso%' }// NOT LIKE '%hat'
            }
        });
    }
    /**
     * Crea un registro de cada contacto
     */
    contacts.map(async (contact, key) => {
        try {

            let tempContact = "";
            console.log(contact)
            if (contact?.phone) {
                tempContact = tempContact.phone;
            } else if (contact?.contact) {
                tempContact = tempContact.contact;
            } else {
                tempContact = contact;
            }

            console.log(tempContact)
            if (!tempContact.includes("+")) {
                tempContact = "+" + tempContact;
            }
            const updated = await massiveMessagesList.findOne({
                where: {
                    msgMassiveId: messageHisotiral.dataValues.id,
                    contact: tempContact,
                }
            })

            if (!updated) {
                await massiveMessagesList.create({
                    msgMassiveId: messageHisotiral.dataValues.id,
                    contact: tempContact,
                    status: 'Pendiente',
                });
            }

        } catch (err) {
            console.log(err);
        }
    })

    /**
     * Envia cada mensaje al contacto
     */

    let count = 1;

    let media = null;

    media = messageHisotiral.dataValues.mediaUrl;

    //console.log("Crea el speech");

    if (!resend) {
        const fs = require('fs');

        fs.writeFileSync(`media/call${messageHisotiral.dataValues.id}.xml`,
            `<Response>
        <Play>${process.env.BASE_URL}/media/${media}</Play>
        </Response>
        `);
    }


    console.log(`
    ${process.env.BASE_URL}/media/${media}`);

    for await (let contact of contacts) {


        /**
         * Trata de hacer la llamada
         */
        try {

            /**
             * NOTA: revisar qué pasa si no se tiene registrado
             */

            //  console.log(`Esperando para enviar mensaje ${messageHisotiral.dataValues.delay}`)
            //await sleep(messageHisotiral.dataValues.delay || 10000);

            let statusTemp = 'Error' + resendText;
            let contactPhoneNumber = "";
            try {

                let tempContact = contact?.phone ? contact.phone : contact?.contact;

                if (contact?.phone) {
                    tempContact = tempContact.phone;
                } else if (contact?.contact) {
                    tempContact = tempContact.contact;
                } else {
                    tempContact = contact;
                }
                contactPhoneNumber = tempContact;
                if (!tempContact.includes("+")) {
                    tempContact = "+" + tempContact;
                }



                await clientTwilio.calls.create({
                    url: `${process.env.BASE_URL}/media/call${messageHisotiral.dataValues.id}.xml`,
                    to: tempContact,
                    from: from,
                    method: 'GET'
                })

                statusTemp = 'Exitoso' + resendText;
                io.sockets.emit(`MSG_SUCCESS${messageHisotiral.dataValues.id}`, { contact: contactPhoneNumber, count: count, status: 'Exitoso' + resendText });
            } catch (err) {
                console.log(err);
                io.sockets.emit(`MSG_SUCCESS${messageHisotiral.dataValues.id}`, { contact: contactPhoneNumber, count: count, status: 'Error' + resendText });
            }


            count++;
            await massiveMessages.update({ totalMessagesSend: count }, { where: { id: messageHisotiral.dataValues.id } });

            // console.log(`MSG_SUCCESS${messageHisotiral.id}`)

            /**
             * Actualiza el estatus
             */
            //  console.log("Envia mensaje");
            try {
                await massiveMessagesList.update(
                    { status: statusTemp },
                    {
                        where: {
                            msgMassiveId: messageHisotiral.dataValues.id,
                            contact: contactPhoneNumber,
                        }
                    });
                //  return true;
            } catch (err) {
                console.log(err);
                // return false
            }
        } catch (err) {
            console.log(err);

            /**
             * Actualiza el estatus
             */
            try {
                io.sockets.emit(`MSG_SUCCESS${messageHisotiral.dataValues.id}`, { contact: contactPhoneNumber, count: count, status: 'Error' + resendText });
                await massiveMessagesList.update(
                    { status: 'Error' + resendText },
                    {
                        where: {
                            msgMassiveId: messageHisotiral.dataValues.id,
                            contact:contactPhoneNumber,
                        }
                    });
                //   return true;
            } catch (err) {
                console.log(err);
                // return false
            }
        }
    }


}


const initIO = (server) => {

    const allowedOrigins = process.env.FRONT_ORIGIN.split(",");
    io = require("socket.io")(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"]
        }
    });

    //console.log(io);
    /**
     * Conexion del socket en general
     */
    io.on('connection', async function (socket) {
        console.log(socket.handshake.query);

        /**
         * El socket manda el objeto con lass sessiones donde tiene permiso
         */
        socket.on('sessionStatus', async function (wpsessions) {


        })

        /**
         *Envia el mensaje al usuario
         */
        socket.on('sendMessage', async function (messageObj) {

            const clientTemp = sessions.getSessionById(messageObj.wpsession);
            const client = clientTemp[0]
            const chat = await client.getChatById(messageObj.idChat);

            if (messageObj.media) {
                const media = MessageMedia.fromFilePath('./media/' + messageObj.media);
                await chat.sendMessage(media, { caption: messageObj.message });
            } else {
                await chat.sendMessage(messageObj.message);
            }


        })

        /**
        *   Se usa para el envio masivo, debe tomar el chat del usuario
        *   Si no se tiene debe crear uno
        */
        socket.on('sendMassiveMessage', sednMessge)

        socket.on('sendMassiveCall', sendCall);

        socket.on('resendMassiveMsg', async function (massiveMsgData) {
            /**
         * Variables para guardar los mensaje y el historial
         */
            let arrMsg = [];
            let historyObj = {};

            /**
             * Recupera el id del webhook
             */
            const { idMassiveMg, delay, pengindIds } = massiveMsgData


            const webhookTemp = await massiveMessages.findOne(
                { where: { id: idMassiveMg } }
            )


            let pendingSends = [];

            if (pengindIds) {
                pendingSends = await massiveMessagesList.findAll({
                    where: {
                        id: pengindIds
                    }
                });
            } else {
                pendingSends = await massiveMessagesList.findAll({
                    where: {
                        msgMassiveId: idMassiveMg,
                        status: { [Op.notLike]: '%Exitoso%' }// NOT LIKE '%hat'
                    }
                });

            }

            //console.log(pendingSends);

            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            /**
             * Valida que exista el webhook con ese token asignado
             */
            try {


                if (webhookTemp) {
                    /**
                    * Recupera el cliente para enviar mensajes
                    */
                    const clientTemp = sesiones.getSessionById(webhookTemp.wpId);
                    const client = clientTemp[0];

                    /**
                     * Recuepra el archivo para el envio
                     */
                    let media;

                    try {
                        if (webhookTemp.mediaUrl) {
                            media = MessageMedia.fromFilePath('./media/' + webhookTemp.mediaUrl);
                        }
                    } catch (err) {
                        console.log(err);
                    }

                    let count = 0;

                    for await (let contactTemp of pendingSends) {
                        let contact = contactTemp.dataValues;
                        try {

                            await sleep(delay | 10000);
                            // console.log(contact)
                            const chat = await client.getChatById(`${contact.contact}@c.us`);

                            if (media) {

                                if (!webhookTemp.mediaUrl.match(/.(jpg|jpeg|png|gif)$/i)) {
                                    await chat.sendMessage(webhookTemp.body);
                                }

                                await chat.sendMessage(media, { caption: webhookTemp.body });
                            } else {
                                /**
                                * Envia el mensaje
                                */
                                await chat.sendMessage(webhookTemp.body);
                            }


                            arrMsg.push(`Se envio el mensaje ${webhookTemp.body} a ${contact.contact}`);

                            /**
                             * Actualiza le estatus el objeto para registrar el log
                             */


                            const updatedLog = {
                                msgMassiveId: webhookTemp.id,
                                contact: `${contact.contact}`,
                                status: 'Exitoso (reenviado)'
                            }





                            const logUpdated = await massiveMessagesList.update(updatedLog, { where: { id: contact.id } });

                            const dateWebhook = await massiveMessagesList.findOne(
                                { where: { id: contact.id } }
                            )
                            count++;
                            await massiveMessages.update({ totalMessagesSend: count }, { where: { id: webhookTemp.id } });
                            io.sockets.emit(`MSG_SUCCESS${webhookTemp.id}`, { contact: `${contact.contact}`, count: count });
                            /* io.sockets.emit(`MSG_SUCCESS${webhookTemp.id}`, {
                                 id: contact.id,
                                 msgMassiveId: webhookTemp.id,
                                 contact: `${contact.contact}`,
                                 status: 'Exitoso (reenviado)',
                                 updatedAt: dateWebhook.updatedAt,
                                 createdAt: dateWebhook.createdAt
                             });*/
                            // contact: contact, count: count 

                            arrMsg.push(`Registro de log ${logUpdated}`);



                        } catch (err) {

                            /**
                              * Actualiza le estatus el objeto para registrar el log
                              */

                            const updatedLog = {
                                msgMassiveId: webhookTemp.id,
                                contact: `${contact.phone2}`,
                                status: 'Error (reenviado)',
                                //  data: err.message
                            }


                            await massiveMessagesList.update(updatedLog, { where: { id: contact.id } });

                            const dateWebhook = await massiveMessagesList.findOne(
                                { where: { id: contact.id } }
                            )

                            io.sockets.emit(`MSG_SUCCESS${webhookTemp.id}`, {
                                id: contact.id,
                                msgMassiveId: webhookTemp.id,
                                contact: `${contact.contact}`,
                                status: 'Exitoso (reenviado)',
                                updatedAt: dateWebhook.updatedAt,
                                createdAt: dateWebhook.createdAt
                            });

                            console.log(err);
                        }

                    }

                }
            } catch (err) {
                //Registra el movimiento el la tabla userlogs
                historyObj.user = 'SystemRoot';
                historyObj.changeType = 'ErrSocketMsgMassiveError';
                historyObj.description = `Err:  ${err.message}`;
                history.regHistory(historyObj);
                console.log(err);
                // arrMsg.push(err.message);


            }
        })


        socket.on('resendWebhook', async function (webhookData) {
            /**
         * Variables para guardar los mensaje y el historial
         */
            let arrMsg = [];
            let historyObj = {};

            /**
             * Recupera el id del webhook
             */
            const { idWebhook, delay, pengindIds } = webhookData


            const webhookTemp = await webhookModel.findOne(
                { where: { id: idWebhook } }
            )


            let pendingSends = [];

            if (pengindIds) {
                pendingSends = await webhooklogModel.findAll({
                    where: {
                        id: pengindIds
                    }
                });
            } else {
                pendingSends = await webhooklogModel.findAll({
                    where: {
                        idHook: idWebhook,
                        status: { [Op.notLike]: '%Exitoso%' }// NOT LIKE '%hat'
                    }
                });

            }

            //console.log(pendingSends);

            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            /**
             * Valida que exista el webhook con ese token asignado
             */
            try {


                if (webhookTemp) {
                    /**
                    * Recupera el cliente para enviar mensajes
                    */
                    const clientTemp = sesiones.getSessionById(webhookTemp.sessionAuth);
                    const client = clientTemp[0];

                    /**
                     * Recuepra el archivo para el envio
                     */
                    let media;

                    try {
                        if (webhookTemp.mediaPath) {
                            media = MessageMedia.fromFilePath('./media/' + webhookTemp.mediaPath);
                        }
                    } catch (err) {
                        console.log(err);
                    }

                    for await (let contactTemp of pendingSends) {
                        let contact = contactTemp.dataValues;
                        try {

                            //console.log(contact)
                            const chat = await client.getChatById(`${contact.phone}@c.us`);

                            if (media) {

                                if (!webhookTemp.mediaPath.match(/.(jpg|jpeg|png|gif)$/i)) {
                                    await chat.sendMessage(webhookTemp.message);
                                }

                                await chat.sendMessage(media, { caption: webhookTemp.message });
                            } else {
                                /**
                                * Envia el mensaje
                                */
                                await chat.sendMessage(webhookTemp.message);
                            }


                            arrMsg.push(`Se envio el mensaje ${webhookTemp.message} a ${contact.phone}`);

                            /**
                             * Actualiza le estatus el objeto para registrar el log
                             */

                            const updatedLog = {
                                idHook: webhookTemp.id,
                                phone: `${contact.phone}`,
                                status: 'Exitoso (reenviado)'
                            }

                            await sleep(delay | 10000);



                            const logUpdated = await webhooklogModel.update(updatedLog, { where: { id: contact.id } });

                            const dateWebhook = await webhooklogModel.findOne(
                                { where: { id: contact.id } }
                            )

                            io.sockets.emit(`WEBHOOK_MSG_STATUS${idWebhook}`, {
                                id: contact.id,
                                idHook: webhookTemp.id,
                                phone: `${contact.phone}`,
                                status: 'Exitoso (reenviado)',
                                updatedAt: dateWebhook.updatedAt,
                                createdAt: dateWebhook.createdAt
                            });
                            arrMsg.push(`Registro de log ${logUpdated}`);



                        } catch (err) {

                            /**
                              * Actualiza le estatus el objeto para registrar el log
                              */

                            const updatedLog = {
                                idHook: webhookTemp.id,
                                phone: `${contact.phone2}`,
                                status: 'Error (reenviado)',
                                data: err.message
                            }


                            await webhooklogModel.update(updatedLog, { where: { id: webhookTemp.id } });

                            const dateWebhook = await webhooklogModel.findOne(
                                { where: { id: webhookTemp.id } }
                            )
                            io.sockets.emit(`WEBHOOK_MSG_STATUS${idWebhook}`, {
                                id: contact.id,
                                idHook: webhookTemp.id,
                                phone: `${contact.phone}`,
                                status: 'Error (reenviado)',
                                updatedAt: dateWebhook.updatedAt,
                                createdAt: dateWebhook.createdAt
                            });
                        }

                    }

                }
            } catch (err) {
                //Registra el movimiento el la tabla userlogs
                historyObj.user = 'SystemRoot';
                historyObj.changeType = 'ExternalWebhookError';
                historyObj.description = `Err:  ${err.message}`;
                history.regHistory(historyObj);
                console.log(err);
                // arrMsg.push(err.message);


            }
        })


        if (socket.handshake.query.user) {
            io.sockets.emit('adviserChange', { email: socket.handshake.query.user, status: 'Conectado' });
            await userModel.update({ status: "Conectado", socketId: socket.id }, { where: { email: socket.handshake.query.user } })
        }
        /**
         * Cierra la conexión si el socket termina
         */
        socket.on('disconnect', async function () {

            io.sockets.emit('adviserChange', { email: socket.handshake.query.user, status: 'Desconectado' });
            if (socket.handshake.query.user) {
                await userModel.update({ status: "Desconectado", socketId: null }, { where: { email: socket.handshake.query.user } })
                console.log(`Cliente desconectado ${socket.id} ${socket.connected}`);
            }
            socket.disconnect();

        })

    });


    return io;
};

const getIO = () => {
    //console.log(io);
    if (!io) {
        console.log('No hay socket inciado');
        throw new AppError("Socket IO not initialized");
    }
    return io;
};

exports.getIO = getIO;
exports.initIO = initIO;
exports.sendMessage = sednMessge;
exports.sendCall = sendCall;