const webhookModel = require("../models").WebHook;
const webhooklogModel = require("../models").WebHookLog;
const wordsModel = require("../models").Word;
const filesModel = require("../models").File;

const history = require('./HistoricoController');
const sesiones = require('../Controllers/TestController')
const { MessageMedia } = require('whatsapp-web.js');
const socketIO = require('../Controllers/SocketController')
const whwordrelation = require("../models").WhWordRelation;
const webhookfilerelation = require("../models").WebhookFileRelation;
const massivemessages = require('../models').MassiveMessage;
const massivemessagelist = require('../models').MassiveMessageList;
const msgschedule = require('../models').MsgSchedule;
const messagetemplate = require('../models').MessageTemplate;
const msgfilerelation = require('../models').MsgFileRelation;
const msgwordrelation = require('../models').MsgWordRelation;

const libphonenumberJs = require('libphonenumber-js');




/**
 * Funcion para esperar una cantidad de segundos
 * @param {*} ms 
 * @returns 
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Controlador para manejar los datos de las sesiones de wp
 * servicios web
 */
module.exports = {
    /**
     * Agrega los archivos y guarda su id para devolver un arreglo
     * @param {*} req 
     * @param {*} res 
     */
    async addFiles(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        const { files } = req.body;

        /**
         * Agrega todos los archivos en la tabal de files
         */

        try {


            let filesArr = [];

            await Promise.all(files.map(async (path, key) => {
                try {
                    const newFile = await filesModel.create({ path: path });
                    filesArr.push(newFile.id)
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
            historyObj.changeType = 'AddFileError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },

    /**
     * Agrega la relacion de archivos y el webhook
     * @param {*} req 
     * @param {*} res 
     */
    async addWebhookFiles(req, res) {
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

                    await webhookfilerelation.create({ webhookId: id, fileId: fileId });
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
            historyObj.changeType = 'AddFileError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },

    /**
    * Elimina la relacion de archivos y el webhook
    * @param {*} req 
    * @param {*} res 
    */
    async removeWebhookFiles(req, res) {
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

                    await webhookfilerelation.destroy({ where: { webhookId: id, fileId: fileId } });
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
            historyObj.changeType = 'AddFileError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },

    /**
     * Obtiene los webhooks actuales
     * @param {*} req 
     * @param {*} res 
     */
    async getWebhooks(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        const { wpSessions } = req.body;

        let filter = {}

        /**
         * Busca los webhooks, si no existen regresa un arreglo vacio
         */
        try {
            let webhooks = await webhookModel.findAll({
                where: filter,
                include: [
                    {
                        model: webhooklogModel,
                    },
                    {
                        model: wordsModel,
                    },
                    {
                        model: filesModel,
                    },

                ],
                order: [
                    ['createdAt', 'DESC'],
                    [webhooklogModel, 'updatedAt', 'DESC'],

                ],
            });




            //console.log(webhooks);


            await Promise.all(webhooks.map(async (wb, key) => {
                let newWords = [];
                // console.log(wb);
                wb.dataValues.Words.map((word, key) => {
                    newWords.push(word.id);
                })

                const schedules = await msgschedule.findAll({ where: { idWebhook: wb.id } })

                wb.dataValues.words = newWords;
                wb.dataValues.schedules = schedules ? schedules : [];
                return true;

            }))



            return res.status(200).send({ status: "Success", count: webhooks.length, webhooks: webhooks });
        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'GetWebhooksError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },


    /**
     * Agrega mensajes programados a un webhook
     * @param {*} req 
     * @param {*} res 
     */
    async addWebhookSchedule(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        const { id, scheduleList } = req.body;

        /**
         * Agrega los mensajes para programar
         */

        try {


            let schedules = [];

            await Promise.all(scheduleList.map(async (schedule, key) => {
                try {

                    const newSchedule = await msgschedule.create({ idWebhook: id, idTemplate: schedule.idTemplate, delay: schedule.delay, name: schedule.name });
                    schedules.push(newSchedule)
                    return true;
                } catch (err) {
                    console.log(err);
                    return false;
                }
            }))

            // console.log(files);
            return res.status(200).send({ status: "Success", count: schedules.length, schedules: schedules });
        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'AddScheduleError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },

    /**
     * Elimina mensajes programados de un webhook
     * @param {*} req 
     * @param {*} res 
     */
    async removeWebhookSchedule(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        const { id } = req.body;

        /**
         * Agrega todos los archivos en la tabal de files
         */

        try {


            const schedule = await msgschedule.destroy({ where: { id: id } });
            // console.log(files);
            return res.status(200).send({ status: "Success", schedule: schedule });
        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'RemoveScheduleError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
    /**
     * Crea o actualiza un webhook
     * @param {*} req 
     * @param {*} res 
     */
    async editWebhook(req, res) {
        /**
        * Variables para guardar los mensaje y el historial
        */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Obtiene los datos para crear un nuevo webhook
         * Si viene el id reemplaza los existentes
         */

        const { id, webhookObj } = req.body;

        try {
            await webhookModel.update(
                webhookObj,
                { where: { id: id } }
            )

            
            return res.status(200).send({ status: "Success", msg: arrMsg });
        }catch(err){
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'UpdateWebhookStatusError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);
            console.log(err);
            return res.status(200).send({ status: "Error", msg: arrMsg });
        }

    },
    /**
    * Crea o actualiza un webhook
    * @param {*} req 
    * @param {*} res 
    */
    async addWebhook(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Obtiene los datos para crear un nuevo webhook
         * Si viene el id reemplaza los existentes
         */

        const { id, webhookObj, words, files } = req.body;

        try {
            delete webhookObj.id;

            webhookObj.sessionAuth = webhookObj.sessionAuth.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '-');
            if (id) {

                const updated = await webhookModel.update(
                    webhookObj,
                    { where: { id: id } }
                )
                arrMsg.push(`Wp actualizado ${updated} ${id}`);


                await whwordrelation.destroy({ where: { webhookId: id } });
                //await webhookfilerelation.destroy({ where: { webhookId: id } });

                if (updated) {
                    words?.map(async (word, key) => {
                        await whwordrelation.create({ webhookId: id, wordId: word });
                    })

                    return res.status(200).send({ status: "Success", msg: arrMsg });
                } else {
                    arrMsg.push(`El webhook no exitste`);
                    return res.status(200).send({ status: "Error", msg: arrMsg });
                }



            } else {

                let newWebhookTemp = { ...webhookObj }

                /**
                 * Genera un token random para el webhook
                 */
                let token = require('crypto').randomBytes(8).toString('hex');

                newWebhookTemp.token = token;

                const newWebhook = await webhookModel.create(newWebhookTemp);

                arrMsg.push(`WebHook creado ${newWebhook.id}`);
                arrMsg.push(newWebhook);

                words?.map(async (word, key) => {
                    await whwordrelation.create({ webhookId: newWebhook.id, wordId: word });
                })


                return res.status(200).send({ status: "Success", msg: arrMsg, id: newWebhook.id });
            }



        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'CreateWebhookError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);
            console.log(err);
            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
    /**
     * Elimina un webhook
     * @param {*} req 
     * @param {*} res 
     */
    async deleteWebhook(req, res) {
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
                const webhookTemp = await webhookModel.findOne(
                    { where: { id: id } }
                )


                const deleted = await webhookModel.destroy(
                    { where: { id: id } }
                )

                if (deleted == 1) {
                    arrMsg.push(`Wp Eliminado ${webhookTemp.name} ${deleted} ${id}`);

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
            historyObj.changeType = 'DelteWebhookError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },

    /**
     * Método que recibe la petición para el webhook
     * NO lleva validación
     * @param {*} req 
     * @param {*} res 
     */
    async tokenRequest(req, res) {

        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Recupera el token de la url
         */
        const token = req.params.token;

        /**
         * Toma los parametros que envia el servicio
         * Lo imporante es el telefono
         */

        let { phone, countryCode } = req.body;

        if (!phone) {
            return res.status(401).send({ status: "Error", msg: 'El telefono es necesario' });
        }

        if (!phone?.replace) {
            console.log(`El teléfono no tiene la funcion replace '${phone}'`);
            phone = '' + phone;
        }

        let phone2 = phone?.replace("+", "");
        let phone3 = phone;

        if (!phone.includes("+")) {
            phone3 = "+" + phone;
        }


        /**
         * Consulta el webhook con sus speech
         * Tambien trae sus archivos
         */
        const webhookTemp = await webhookModel.findOne(
            {
                where: { token: token },
                include: [
                    {
                        model: wordsModel,
                    },
                    {
                        model: filesModel,
                    },

                ],
            }
        )

        if (!webhookTemp) {
            arrMsg.push("El token no existe")
            return res.status(401).send({ status: "Error", msg: arrMsg });
        }





        /**
        * Genera le fecha actual para buscar/crear el grupo de envio
        */
        const d = new Date();
        let year = d.toLocaleString("default", { year: "numeric", timeZone: process.env.TZ || 'America/Lima' });
        let month = d.toLocaleString("default", { month: "2-digit", timeZone: process.env.TZ || 'America/Lima' });
        let day = d.toLocaleString("default", { day: "2-digit", timeZone: process.env.TZ || 'America/Lima' });
        const today = `${year}-${month}-${day}`;

        /**
         * Busca si existe el grupo con la fecha actual
         */
        const massiveGroup = await massivemessages.findOne(
            {
                where: { name: `${webhookTemp.name} ${today}` },
                attributes: ['id', 'name', 'totalMessagesSend'],

            }
        );

        /**
        * Busca todos los mensajes programados
        */
        const msgscheduleList = await msgschedule.findAll(
            {
                where: { idWebhook: webhookTemp.id },
                include: [
                    {
                        model: messagetemplate,
                        include: [
                            {
                                model: filesModel,

                            },
                            {
                                model: wordsModel,

                            },

                        ],
                    },

                ],
            }
        );


        await Promise.all(msgscheduleList.map(async (msgS, key) => {


            let resendGroup = null;
            /**
            * Busca si existe el grupo de reenvio
            */
            const resendGroupTemp = await massivemessages.findOne(
                {
                    where: { resendId: msgS.id },
                    attributes: ['id'],

                }
            );

            /**
             * Si no existe el grupo de renvio, se crea uno
             */


            if (!resendGroupTemp?.id) {

                const msgObj = {
                    name: `${msgS.name}`,
                    kind: 'Resend',
                    forwardingId: 0,
                    resendId: msgS.id,
                    wpId: webhookTemp.sessionAuth,
                    isMedia: false,
                    body: msgS.MessageTemplate.message,
                    mediaUrl: msgS.MessageTemplate.filePath,
                    userSend: 'Resend',
                    delay: 1000,
                    status: 'Pendiente',
                    totalMessagesSend: 0,
                    totalMessagesLost: 0,
                    totalMessages: 0,
                }

                try {
                    resendGroup = await massivemessages.create(msgObj);

                    await msgschedule.update({ idMassive: resendGroup.id }, { where: { id: msgS.id } });
                    /**
                    * Agrega los archivos al grupo
                    */
                    try {

                        await Promise.all(msgS.MessageTemplate.Files.map(async (f, k) => {

                            await msgfilerelation.create({ massiveMessageId: resendGroup.id, fileId: f.id })
                            return true;
                        }))



                    } catch (er) {
                        console.log("Error al agregar archivos");
                        console.log(er);
                    }

                    try {

                        await Promise.all(msgS.MessageTemplate.Words.map(async (word, key) => {
                            //console.log("Asignando palabra");
                            //console.log(word),
                            await msgwordrelation.create({ massiveMessageId: resendGroup.id, wordId: word.id });
                            return true;
                        }))

                    } catch (er) {
                        console.log("Error al agregar speachs");
                        console.log(er);
                    }
                } catch (err) {
                    console.log("Error al crear grupo de reenvio");
                    console.log(err);
                }



            } else {
                resendGroup = resendGroupTemp;
            }

            /**
             * Programa el reenvio acorde al tiempo de diferencia
             * El tiempo se toma en horas
             * delay
             */

            let retraso = msgS.delay || 60;

            let dateProgram = new Date();
            //dateProgram.setHours(dateProgram.getHours() + retraso);
            dateProgram.setTime(dateProgram.getTime() + (1000 * 60 * retraso));
            dateProgram = dateProgram.toLocaleString('sv-SE', { timeZone: process.env.TZ || 'America/Lima' })



            if (countryCode) {
                //console.log(phone3)

                const phoneNumber = libphonenumberJs.parsePhoneNumberFromString(phone, countryCode);

                let countryCode2 = phoneNumber.number.replace(phoneNumber.nationalNumber, '');

                const valid = libphonenumberJs.isValidPhoneNumber(phoneNumber.number, countryCode2);

                console.log(`${countryCode} ${countryCode2}`)

                phone2 = phoneNumber.number.trim().replace("+", "");
            }

            /**
            * Crea el nuevo registro para la bitacora
            */
            await massivemessagelist.create({
                msgMassiveId: resendGroup.id,
                contact: phone2,
                status: 'Pendiente',
                sendAt: dateProgram
            });

            return true;
        }))

        /**
         * Objeto que contiene el grupo de envio
         */
        let messageHistorial;


        /**
         * Si no existe el grupo de envio, se crea uno
         */
        if (massiveGroup?.id) {
            messageHistorial = massiveGroup;
        } else {

            const msgObj = {
                name: `${webhookTemp.name} ${today}`,
                kind: 'Webhook',
                forwardingId: 0,
                wpId: webhookTemp.sessionAuth,
                isMedia: webhookTemp.mediaPath ? true : false,
                body: webhookTemp.message,
                mediaUrl: webhookTemp.mediaPath,
                userSend: 'Test',
                delay: 10000,
                status: 'Pendiente',
                totalMessagesSend: 0,
                totalMessagesLost: 0,
                totalMessages: 0,
            }

            try {
                messageHistorial = await massivemessages.create(msgObj);
            } catch (err) {
                console.log("Este es el error");
                console.log(err);
            }

        }


        /**
         * Crea el nuevo registro para la bitacora
         */
        let msgLisReg = await massivemessagelist.create({
            msgMassiveId: messageHistorial.id,
            contact: phone2,
            status: 'Pendiente',
        });


        /**
         * Valida que exista el webhook con ese token asignado
         */
        try {

            if (countryCode) {
                //console.log(phone3)

                const phoneNumber = libphonenumberJs.parsePhoneNumberFromString(phone, countryCode);

                let countryCode2 = phoneNumber.number.replace(phoneNumber.nationalNumber, '');

                const valid = libphonenumberJs.isValidPhoneNumber(phoneNumber.number, countryCode2);

                console.log(`${countryCode} ${countryCode2}`)

                phone2 = phoneNumber.number.trim().replace("+", "");
                // phone2 = formated;
                //console.log(`${valid} ${validLength.isValid()} ${validLength.phone}`)
                if (!valid) {
                    throw "Telefono no valido";
                }
            }

            /**
             * Crea el objeto para registrar el log
             */

            const newlog = {
                idHook: webhookTemp.id,
                phone: `${phone2}`,
                status: 'Pendiente'
            }

            const logCreated = await webhooklogModel.create(newlog);


            /**
            * Recupera el cliente para enviar mensajes
            */


            const clientTemp = sesiones.getSessionById(webhookTemp.sessionAuth);
            const client = clientTemp[0];
            let media;
            let chat;
            //console.log(phone2);
            if (!process.env.TEST) {


                try {
                    // console.log(webhookTemp.sessionAuth)
                    // console.log(phone2)
                    chat = await client.getChatById(`${phone2}@c.us`);
                } catch (err) {
                    console.log("Error al recuperar cliente");
                    console.log(err);
                }




                try {
                    if (webhookTemp.mediaPath) {
                        media = MessageMedia.fromFilePath('./media/' + webhookTemp.mediaPath);
                    }
                } catch (err) {
                    console.log(err);
                }

            }

            let newMsg = webhookTemp.message;
            // console.log(webhookTemp);
            for (let i = 0; i < webhookTemp.dataValues.Words.length; i++) {

                // console.log(webhookTemp.dataValues.Words[i].dataValues);
                const speechArr = webhookTemp.dataValues.Words[i]['replace'].split(',');

                let newIndex = logCreated.id % speechArr.length;

                newMsg = newMsg.replace(webhookTemp.dataValues.Words[i].dataValues.word, speechArr[newIndex]);

                //console.log(newMsg);

            }

            /**
             * Espera un tiempo entre 1 y 5 seg dependiendo del id
             */
            let timeToWait = ((logCreated.id % 5) + 1) * 1000;
            await sleep(timeToWait);

            if (!process.env.TEST) {
                if (webhookTemp.Files.length > 0) {

                    /**
                     * Si tiene archivos los envia todos
                     * Adjunta el mensaje al primero
                     */
                    Promise.all(webhookTemp.Files.map(async (f, k) => {

                        let mediaTemp = MessageMedia.fromFilePath('./media/' + f.path);

                        if (k == 0) {
                            if (!f.path.match(/.(jpg|jpeg|png|gif)$/i)) {
                                await chat.sendMessage(newMsg);
                            }

                            await chat.sendMessage(mediaTemp, { caption: newMsg });
                        } else {
                            await chat.sendMessage(mediaTemp);
                        }
                    }))


                } else {
                    /**
                    * Envia el mensaje
                    */
                    await chat.sendMessage(newMsg);
                }
            }



            arrMsg.push(`El mensaje espero ${timeToWait / 1000} s para enviarse`);
            arrMsg.push(`Se envió el mensaje ${newMsg} a ${phone2} con ${webhookTemp.Files.length} archivos`);

            /**
             * Actualiza el conteo en el grupo de envio
             */

            let count = messageHistorial.totalMessagesSend + 1;
            //console.log(messageHistorial);
            await massivemessages.update({ totalMessagesSend: count }, { where: { id: messageHistorial.id } });

            /**
             * Actualiza el estatus del registro
             */
            await massivemessagelist.update(
                { status: 'Exitoso' },
                {
                    where: {
                        id: msgLisReg.id
                    }
                }
            );
            /**
             * Actualiza le estatus el objeto para registrar el log
             */

            const updatedLog = {
                idHook: webhookTemp.id,
                phone: `${phone2}`,
                status: 'Exitoso',
                data: `El mensaje espero ${timeToWait / 1000} s para enviarse`,
            }

            const logUpdated = await webhooklogModel.update(updatedLog, { where: { id: logCreated.id } });


            arrMsg.push(`Registro de log ${logUpdated}`);

            const logDates = await webhooklogModel.findOne({ where: { id: logCreated.id } });

            //  console.log(logDates);

            socketIO.getIO().sockets.emit(`WEBHOOK_MSG_STATUS${webhookTemp.id}`, {
                id: logCreated.id,
                idHook: webhookTemp.id,
                phone: `${phone2}`,
                status: 'Exitoso',
                updatedAt: logDates.dataValues.updatedAt,
                createdAt: logDates.dataValues.createdAt
            });

            socketIO.getIO().sockets.emit(`MSG_SUCCESS${messageHistorial.id}`, { contact: phone2, count: count, newContact: { contact: phone2, id: msgLisReg.id, status: 'Exitoso' } });

            return res.status(200).send({ status: "Success", msg: arrMsg });



        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'ExternalWebhookError';
            historyObj.description = `Err ${webhookTemp.sessionAuth}:  ${err} `;
            history.regHistory(historyObj);

            arrMsg.push(err.message);
            console.log(err);


            /**
            * Actualiza el estatus del registro
            */
            await massivemessagelist.update(
                { status: 'Error' },
                {
                    where: {
                        id: msgLisReg.id
                    }
                }
            );
            /**
              * Actualiza le estatus el objeto para registrar el log
              */

            const updatedLog = {
                idHook: webhookTemp.id,
                phone: `${phone2}`,
                status: 'Error',
                data: err.message
            }

            await webhooklogModel.update(updatedLog, { where: { id: logCreated.id } });

            const logDates = await webhooklogModel.findOne({ where: { id: logCreated.id } });

            //console.log(logDates);

            socketIO.getIO().sockets.emit(`WEBHOOK_MSG_STATUS${webhookTemp.id}`, {
                id: logCreated.id,
                idHook: webhookTemp.id,
                phone: `${phone2}`,
                status: 'Error',
                updatedAt: logDates.dataValues.updatedAt,
                createdAt: logDates.dataValues.createdAt
            });

            let count = messageHistorial.totalMessagesSend + 1;

            socketIO.getIO().sockets.emit(`MSG_SUCCESS${messageHistorial.id}`, { contact: phone2, count: count, newContact: { contact: phone2, id: msgLisReg.id, status: 'Error' } });

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
    async resendWebhookMessage(req, res) {

        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Recupera el id del webhook
         */
        const idWebhook = req.params.id;
        const idHistory = req.params.idHistory;




        /**
         * Revisa que el registro este como pendiente o en error
         */
        try {
            const logHistory = await webhooklogModel.findOne({ where: { id: idHistory } });

            if (logHistory?.status.includes('Exitoso')) {

                const webhookTemp = await webhookModel.findOne(
                    { where: { id: idWebhook } }
                )

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
                    try {
                        const chat = await client.getChatById(`${logHistory.phone}@c.us`);

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


                        arrMsg.push(`Se envio el mensaje ${webhookTemp.message} a ${logHistory.phone}`);

                        /**
                         * Actualiza le estatus el objeto para registrar el log
                         */

                        const updatedLog = {
                            idHook: webhookTemp.id,
                            phone: `${logHistory.phone}`,
                            status: 'Exitoso (reenviado)',
                            updateAt: webhookTemp.updatedAt,
                            createdAt: webhookTemp.createdAt
                        }

                        socketIO.getIO().sockets.emit(`WEBHOOK_MSG_STATUS${idWebhook}`, {
                            contact: logHistory.phone, status: 'Exitoso (reenviado)', updateAt: webhookTemp.updatedAt,
                            createdAt: webhookTemp.createdAt
                        });

                        const logUpdated = await webhooklogModel.update(updatedLog, { where: { id: idHistory } });

                        arrMsg.push(`Registro de log ${logUpdated}`);

                        await sleep(delay | 10000);

                    } catch (err) {

                        /**
                          * Actualiza le estatus el objeto para registrar el log
                          */

                        const updatedLog = {
                            idHook: webhookTemp.id,
                            phone: `${logHistory.phone}`,
                            status: 'Error',
                            data: err.message,
                            u
                        }
                        socketIO.getIO().sockets.emit(`WEBHOOK_MSG_STATUS${idWebhook}`, {
                            contact: contact.phone, status: 'Error', updateAt: webhookTemp.updatedAt,
                            createdAt: webhookTemp.createdAt
                        });

                        await webhooklogModel.update(updatedLog, { where: { id: idHistory } });
                    }
                } catch (err) {

                    historyObj.user = 'SystemRoot';
                    historyObj.changeType = 'ResendWebhookError';
                    historyObj.description = `Err:  ${err.message}`;
                    history.regHistory(historyObj);

                    console.log(err);
                }
            }



        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'ResendWebhookError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            // arrMsg.push(err.message);


        }
    },
    /**
     * Actualiza un telefono de la bitacora
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async updateWebhookPhone(req, res) {


        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Recupera el id del telefono
         */
        const { id, phone, status } = req.body;

        /**
         * Revisa que el registro este como pendiente o en error
         */
        try {
            const logHistory = await webhooklogModel.update(
                { phone: phone, status: status },
                { where: { id: id } },
            );

            return res.status(200).send({ status: "Success", msg: logHistory });

        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'UpdatePhoneWHError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            // arrMsg.push(err.message);


        }
    },

    /**
     * Actualiza un telefono de la bitacora
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async updateMsgListPhone(req, res) {


        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Recupera el id del telefono
         */
        const { id, contact, status } = req.body;

        /** 
         * Revisa que el registro este como pendiente o en error
         */
        try {
            const logHistory = await massivemessagelist.update(
                { contact: contact, status: status },
                { where: { id: id } },
            );

            return res.status(200).send({ status: "Success", msg: logHistory });

        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'UpdatePhoneMsgError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            // arrMsg.push(err.message);


        }
    },

    /**
     * Método que recibe la petición cuando twilio da una respuesta
     * @param {*} req 
     * @param {*} res 
     */
    async twilioCallbackRequest(req, res) {

        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Recupera el token de la url
         */
        const id = req.params.logId;


        try{
            const {CallStatus,Duration,CallDuration} = req.body;


    
            await massivemessagelist.update({status:CallStatus==='completed' ? 'Exitoso': 'Error (twilio)',twilioStatus: CallStatus,duration: `${Duration}-${CallDuration}`},{
                where: {id: id}
            });

            const massiveMessge =  await massivemessagelist.findOne({
                where: {id: id}
            });
    
        
    
            socketIO.getIO().sockets.emit(`MSG_SUCCESS${massiveMessge.dataValues.msgMassiveId}`, { contact: massiveMessge.dataValues.contact, count: 0, newContact: { contact: massiveMessge.dataValues.contact, id: massiveMessge.dataValues.id, status: CallStatus==='completed' ? 'Exitoso': 'Error (twilio)',twilioStatus: CallStatus } });
        }catch(err){
            const {CallStatus,Duration,CallDuration} = req.body;


            await massivemessagelist.update({twilioStatus: CallStatus,duration: `${Duration}-${CallDuration}`},{
                where: {id: id}
            });

    
            const massiveMessge =  await massivemessagelist.findOne({
                where: {id: id}
            });
    

            socketIO.getIO().sockets.emit(`MSG_SUCCESS${massiveMessge.dataValues.msgMassiveId}`, { contact: massiveMessge.dataValues.contact, count: 0, newContact: { contact: massiveMessge.dataValues.contact, id: massiveMessge.dataValues.id, status: 'Error',twilioStatus: CallStatus } });
        }

       


        return res.status(200).send({ status: "Success", msg: arrMsg });
    },

};
