
const history = require('./HistoricoController');
const wpsession = require('../models/').WpSession;
const { Client, LocalAuth } = require('whatsapp-web.js');
const chatModel = require('../models').Chat;
const messageModel = require('../models').Message;
const fs = require('fs');
const mime = require('mime-types')
const qrcode = require('qrcode-terminal');
const socketIO = require('../Controllers/SocketController');

/**
 * Espera un número de milisegundos
 * @param {*} ms 
 * @returns 
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Convierte de un objeto de chat a un objeto para la tabla local
 * @param {C} chat 
 * @returns 
 */
function convertToLocalChat(chat, wpSessionId, message) {


    const newChat = {
        ...chat,
        whatsappId: chat.id._serialized,
        wpSessionId: wpSessionId,
        phone: chat.id.user,
        status: 'Nuevo',
        lastMessage: message,
        timestamp: new Date(chat.timestamp * 1000),
        lastUpdated: chat.lastUpdated ? new Date(chat.lastUpdated * 1000) : null,
        id: 0
    }

    return newChat;
}

/**
 * Revisa si existe el chat sino lo crea
 * @param {} chat 
 */
async function updateOrCreateChat(chat, wpSessionId, message) {


    const chatTemp = await chatModel.findAll({
        where: {
            whatsappId: chat.id._serialized,
            wpSessionId: wpSessionId
        }
    })

    if (chatTemp.length > 0) {

        let updatedChat = convertToLocalChat(chat, wpSessionId, message);

        delete updatedChat.id;
        await chatModel.update(
            updatedChat,
            {
                where: {
                    whatsappId: chat.id._serialized
                }
            }
        );

        return chatTemp[0];
    } else {
        const newChat = await chatModel.create(convertToLocalChat(chat, wpSessionId, message));
        return newChat;
    }
}


/**
 * Convierte de un objeto de mensaje a un objeto para la tabla local
 * @param {C} chat 
 * @returns 
 */
function convertToLocalMessage(wpMessage, chatId) {



    const newMessage = {
        ...wpMessage,
        wpId: wpMessage.id.id,
        chatId: chatId,
        mentionedIds: JSON.stringify(wpMessage.mentionedIds),
        timestamp: new Date(wpMessage.timestamp * 1000),
        id: 0
    }

    return newMessage;
}

/**
 * Revisa si existe el mensaje sino lo crea
 * @param {} chat 
 */
async function updateOrCreateMessage(message, chaId) {


    const chatTemp = await messageModel.findAll({
        where: {
            wpId: message.id.id
        }
    })

    if (chatTemp.length > 0) {

        let updatedMessage = convertToLocalMessage(message, chaId);

        delete updatedMessage.id;
        await messageModel.update(
            updatedMessage,
            {
                where: {
                    wpId: message.id.id
                }
            }
        );
    } else {
        await messageModel.create(convertToLocalMessage(message, chaId));
    }
}
module.exports = {

    /**
     * Crea la sesion y valida si tiene permisos sobre algún wp
     * @param {*} req 
     * @param {*} res 
     */
    async getSessions() {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Busca las sessiones, si no existen regresa un arreglo vacio
         */
        try {
            const sessions = await wpsession.findAll();
            return sessions;
        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'GetSessionsError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(`El password es requerido`);
            arrMsg.push(err.message);

            return [];
        }
    },
    /**
     * Crea un neuvo cliente
     * Si existe authSession recupera la sesión
     * @param {*} authSession 
     */
    async createClient(id, authSession, status) {

        if (status == null || status == 'QR' || status == 'Esperando') {
            // console.log(`Borrando sesion ${authSession}`);
            //console.log(`${process.cwd()}/.wwebjs_auth/session-${authSession}`);
            fs.rmSync(`${process.cwd()}/.wwebjs_auth/session-${authSession}`, { recursive: true, force: true });
        }
        await wpsession.update({ status: "Esperando" }, { where: { id: id } })
        /**
         * Crea el cliente con la session
         */
        const client = new Client({
            authStrategy: new LocalAuth({ clientId: authSession }),
            takeoverOnConflict: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--unhandled-rejections=strict']
        });

        /**
         * Si se inicializa bien entonces se mada mensaje
         */

        client.on('authenticated', async (session) => {
            console.log(`Logueo exitoso para la sesion ${authSession}`);
            await wpsession.update({ status: "Conectado" }, { where: { id: id } })
        });

        /**
         * Si ocurre un error al autenticar
         */
        client.on('auth_failure', async (err) => {
            console.log(err);
            await wpsession.update({ status: "Error" }, { where: { id: id } })
        });

        /**
         * Si ocurre un error al autenticar
         */
        client.on('disconnected', async (err) => {
            console.log(err);
            await wpsession.update({ status: "Desconectado" }, { where: { id: id } })
            //client.logout();
            //client.destroy();
            fs.rmSync(`${process.cwd()}/.wwebjs_auth/session-${authSession}`, { recursive: true, force: true });
            //client.logout();
        });

        client.on('qr', async (qr) => {
            qrcode.generate(qr, { small: true });
            await wpsession.update({ status: "QR", qr: qr }, { where: { id: id } })
        });

        /**
         * Cuando el cliente esta listo entonces sincronizamos los chats
         */
        client.on('ready', async () => {
            // console.log(client)
            const chats = await client.getChats();

            try {
                chats.map(async (chat, key) => {
                    try {
                        const messages = await chat.fetchMessages({ limit: 10 });
                        /**
                         * Toma el ultimo mensaje
                         */
                        const lastMessage = await chat.fetchMessages({ limit: 1 });

                        /**
                         * Recupera el chat para usar su id
                         */
                        const newChat = await updateOrCreateChat(chat, id, lastMessage[0]?.body);

                        /**
                         * Guarda todos los mensajes del chat
                         */



                        messages.map(async (message, key) => {

                            //console.log();
                            if (message.hasMedia) {
                                try {

                                    const media = await message.downloadMedia();
                                    const ext = mime.extension(media.mimetype)
                                    const mediaPath = `${message.id.id}.${ext}`;

                                    fs.writeFile(
                                        "./media/" + mediaPath,
                                        media.data,
                                        "base64",
                                        function (err) {
                                            if (err) {
                                                console.log(err);
                                            }
                                        }
                                    );
                                    /**
                                     * Guarda la ruta del archivo 
                                     */
                                    message.mediaUrl = mediaPath;
                                } catch (err) {
                                    console.log(err);
                                }

                            }

                            await updateOrCreateMessage(message, newChat.id);
                        })
                    } catch (err) {
                        console.log(err);
                        console.log("Error al sincronizar mensajes");
                    }

                });
            } catch (err) {
                console.log(err);
                console.log("Error al sincronizar mensajes");
            }

        });

        /**
         * Cada que llegué un mensaje se guarda
         */

        client.on('message_create', async (message) => {

            if (message.hasMedia) {

                try {
                    const media = await message.downloadMedia();
                    const ext = mime.extension(media.mimetype)
                    const mediaPath = `${message.id.id}.${ext}`;

                    fs.writeFile(
                        "./media/" + mediaPath,
                        media.data,
                        "base64",
                        function (err) {
                            if (err) {
                                console.log(err);
                            }
                        }
                    );
                    /**
                     * Guarda la ruta del archivo 
                     */
                    message.mediaUrl = mediaPath;
                } catch (err) {
                    console.log(err);
                }


            }
            const chat = await message.getChat();

            chat.lastUpdated = message.timestamp;

            /**
             * Recupera el chat para usar su id
             */
            const newChat = await updateOrCreateChat(chat, id, message.body);
            await updateOrCreateMessage(message, newChat.id);

        });
        console.log("Iniciando cliente");

        try {
            client.initialize().catch(ex => { console.log(error) });
        } catch (err) {
            console.log("Ocurrio un error");
            console.log(err);
        }


        return client;
    },
    /**
     * Crea un neuvo cliente
     * Si existe authSession recupera la sesión
     * @param {*} authSession 
     */
    async createClientV2(id, authSession, status) {
        //  console.log(status)
        if (status == null || status == 'QR' || status == 'Esperando' || status=='Error') {
            // console.log(`Borrando sesion ${authSession}`);
            //console.log(`${process.cwd()}/.wwebjs_auth/session-${authSession}`);
            await wpsession.update({ status: "Esperando" },{ where: { id: id } })
            //fs.rmSync(`${process.cwd()}/.wwebjs_auth/session-${authSession}`, { recursive: true, force: true });
        }
        await wpsession.update({ status: "Esperando" }, { where: { id: id } })
        /**
         * Crea el cliente con la session
         */

        console.log(`Iniciando cliente instancia ${authSession}`);
        const client = new Client({
            authStrategy: new LocalAuth({ clientId: authSession }),
            takeoverOnConflict: true,
            puppeteer: {
                // executablePath: process.env.PUPPETER,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--unhandled-rejections=strict']
            }
        });

        

        return client;
    },
    /**
    * Crea la instancia de un cliente 
    * @param {*} client 
    * @param {*} socket 
    */

    initClient(client, socket) {
        //console.log(client);
        client.on('message_create', async (message) => {
            //console.log(message.body);
            if (socket.connected) {
                const chat = await message.getChat();

                /**
                 * Si no es el propio entonces aumenta el undreadcount 
                 */

                let unreadCount = chat.unreadCount;

                if (!message.fromMe) {
                    unreadCount++;
                }
                /**
                 * Si es un archivo entonces se envia en base 64
                 */
                let media = {};

                const newMessage = {

                    wpId: message.id.id,
                    timestamp: new Date(message.timestamp * 1000),
                    body: message.body,
                    fromMe: message.fromMe ? 1 : 0,
                    hasMedia: message.hasMedia,

                    id: 0
                }


                if (message.hasMedia) {

                    const media = await message.downloadMedia();
                    const ext = mime.extension(media.mimetype)
                    const mediaPath = `${message.id.id}.${ext}`;


                    newMessage.mediaUrl = mediaPath;

                }



                socket.emit('NEW_MESSAGE', { msg: newMessage, unreadCount: unreadCount, chatId: chat.id._serialized });

            }

        });
    },
    /**
     * Crea la instancia de un cliente 
     * @param {*} client 
     * @param {*} socket 
     */

    initClientV2(client, authSession, id, loadMessages) {
        try {

            socketIO.getIO().sockets.emit('waiting' + authSession, { wp: authSession });
            /**
            * Si se inicializa bien entonces se mada mensaje
            */
            client.on('authenticated', async (session) => {
                console.log(`Logueo exitoso para la sesionauthenticated ${authSession}`);
                await wpsession.update({ status: "Conectado" }, { where: { sessionAuth: authSession } })
                socketIO.getIO().sockets.emit('authenticated' + authSession, { wp: authSession });
                
            });

            /**
             * Si ocurre un error al autenticar
             */
            client.on('auth_failure', async (err) => {
                console.log(err);
               
                await wpsession.update({ status: "Error" }, { where: { sessionAuth: authSession } })
                socketIO.getIO().sockets.emit('fail' + authSession, { wp: authSession });
            });

            /**
             * Si ocurre un error al autenticar
             */
            client.on('disconnected', async (err) => {
                console.log(err);
                
                await wpsession.update({ status: "Reconectar" }, { where: { sessionAuth: authSession } })
                socketIO.getIO().sockets.emit('diconnected' + authSession, { wp: authSession });

                await sleep(7000);
               // client.initialize()
                //fs.rmSync(`${process.cwd()}/.wwebjs_auth/session-${authSession}`, { recursive: true, force: true });
                // client.logout();
            });

            client.on('qr', async (qr) => {
                //  qrcode.generate(qr, { small: true });
                
                await wpsession.update({ status: "QR", qr: qr }, { where: { sessionAuth: authSession } })
                socketIO.getIO().sockets.emit('qr' + authSession, { data: { qr: qr, test: "test", wp: authSession } });
            });

            /**
             * Cuando el cliente esta listo entonces sincronizamos los chats
             */
            client.on('ready', async () => {
                //   console.log(client)

                const chats = await client.getChats();



                try {
                    const loadMessages = await wpsession.findOne({ where: { sessionAuth: authSession } })

                    if(loadMessages){

                        if(!loadMessages.loadMessages || loadMessages?.loadMessages == 'false'){
                            console.log(`No se cargaran contactos para ${authSession}`);
                            return false;
                        }

                    }

                    console.log(`Cargando ${chats.length} chats`);

                    let countChats = 0;
                    await wpsession.update({ totalChats:chats.length,loadedChats: countChats  }, { where: { sessionAuth: authSession } })


                    chats.map(async (chat, key) => {
                        try {



                            /**
                            * Toma el ultimo mensaje
                            */
                            const lastMessage = await chat.fetchMessages({ limit: 1 });

                            /**
                             * Recupera el chat para usar su id
                             */
                            const newChat = await updateOrCreateChat(chat, id, lastMessage[0]?.body);

                            countChats++;
                            await wpsession.update({ totalChats:chats.length,loadedChats: countChats  }, { where: { sessionAuth: authSession } })
                            socketIO.getIO().sockets.emit('chatAdded' + authSession, { wp: authSession });

                            if (!loadMessages) {
                                //console.log(`No se cargaron los mensajes de ${authSession}`);
                                return true;
                            }

                           
                            
                            const messages = await chat.fetchMessages({ limit: 20 });

                            //  console.log(`Anchura de los mensajes ${messages.length}`)
                            /**
                             * Guarda todos los mensajes del chat
                             */
                            let count = 1;
                            await Promise.all(messages.map(async (message, key) => {
                                //console.log(`Mensaje ${count} para chat ${newChat.id}`);

                                if (message.hasMedia) {
                                    try {

                                       /* const media = await message.downloadMedia();
                                        const ext = mime.extension(media.mimetype)
                                        const mediaPath = `${message.id.id}.${ext}`;

                                        fs.writeFile(
                                            "./media/" + mediaPath,
                                            media.data,
                                            "base64",
                                            function (err) {
                                                if (err) {
                                                    console.log(err);
                                                }
                                            }
                                        );
                                        /**
                                         * Guarda la ruta del archivo 
                                        
                                        message.mediaUrl = mediaPath; */
                                    } catch (err) {
                                        console.log(err);
                                    }

                                }

                                await updateOrCreateMessage(message, newChat.id);
                                count++;
                                return 1;
                            }))
                        } catch (err) {
                            console.log(err);
                            console.log("Error al sincronizar mensajes");
                            return 1;
                        }

                    });

                    /**
                     * Actualiza la bandera para no volver a cargar los mensajes
                     */

                    await wpsession.update({ loadMessages:'false' }, { where: { sessionAuth: authSession } })
                } catch (err) {
                    console.log(err);
                    console.log("Error al sincronizar mensajes");
                }

            });

            /**
             * Cada que llegué un mensaje se guarda
             */

            client.on('message_create1', async (message) => {

                if (loadMessages) {
                    const chat = await message.getChat();



                    /**
                     * Si no es el propio entonces aumenta el undreadcount 
                     */

                    let unreadCount = chat.unreadCount;

                    if (!message.fromMe) {
                        unreadCount++;
                    }
                    /**
                     * Si es un archivo entonces se envia en base 64
                     */
                    let media = {};

                    const newMessage = {

                        wpId: message.id.id,
                        timestamp: new Date(message.timestamp * 1000),
                        body: message.body,
                        fromMe: message.fromMe ? 1 : 0,
                        hasMedia: message.hasMedia,

                        id: 0
                    }

                    if (message.hasMedia) {

                        try {
                            const media = await message.downloadMedia();
                            const ext = mime.extension(media.mimetype)
                            const mediaPath = `${message.id.id}.${ext}`;

                            fs.writeFile(
                                "./media/" + mediaPath,
                                media.data,
                                "base64",
                                function (err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                }
                            );
                            /**
                             * Guarda la ruta del archivo 
                             */
                            message.mediaUrl = mediaPath;
                            newMessage.mediaUrl = mediaPath;
                        } catch (err) {
                            console.log(err);
                        }


                    }




                    socketIO.getIO().sockets.emit('NEW_MESSAGE', { msg: newMessage, unreadCount: unreadCount, chatId: chat.id._serialized });




                    chat.lastUpdated = message.timestamp;

                    /**
                     * Recupera el chat para usar su id
                     */
                    const newChat = await updateOrCreateChat(chat, id, message.body);
                    await updateOrCreateMessage(message, newChat.id);
                }



            });
            console.log("Iniciando cliente");
            try {
                client.initialize().catch(ex => { console.log(ex) });
            } catch (err) {
                console.log("Ocurrio un error");
                console.log(err);
            }
        } catch (err) {
            console.log("Ocurrio un error");
        }
    },

    listenStatus(client, socket, whats) {

     //   console.log("Cliente conectado a estatus");
        client.on('qr', async (qr) => {
            // qrcode.generate(qr, { small: true });
            //await wpsession.update({ status: "QR",qr:qr }, { where: { id: id } })
            socket.emit('qr', { data: { qr: qr, test: "test", wp: whats } });
        });

        client.on('authenticated', async (session) => {
            // console.log(`Logueo exitoso para la sesion ${authSession}`);
            // await wpsession.update({ status: "Conectado" }, { where: { id: id } })
            socket.emit('authenticated', { wp: whats });
        });
    }
};