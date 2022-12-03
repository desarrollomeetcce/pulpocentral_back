const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

/**
 * Permite leer las variables de entorno
 * Las variables de entorno estan en el archivo .env
 */
require('dotenv').config()


const wpsessionController = require('./Controllers/WpSessionController')

const scheduleMsgController = require('./Controllers/ScheduleMsgController')

const { Client, LocalAuth } = require('whatsapp-web.js');
const sesiones = require('./Controllers/TestController')



const socketIO = require('./Controllers/SocketController')
const CronJob = require('cron').CronJob;


socketIO.initIO(server);

const bodyParser = require('body-parser');

/**
 * Lee el body y lo convierte en JSON para su uso
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// El servidor debería empezar a escuchar
server.listen(process.env.PORT);

/**
 * Permite la comunicación con el frontend en caso de estar en diferentes puertos o ips
 * Permite el header que contiene la sesión del token 'x-access-token'
 * Permite los métodos POST,GET y PATCH
 */
app.use(function (req, res, next) {

    const allowedOrigins = process.env.FRONT_ORIGIN.split(",");

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,pulpocentral-access-token");
    res.header("Access-Control-Allow-Methods", "POST,GET,PATCH,PUT");
    next();
});

/**
 * Agregamos las rutas del archivo
 */

require('./routes')(app);


// Registre la ruta de índice de su aplicación que devuelve el archivo HTML
app.get('/', function (req, res) {
    console.log("Homepage");
    res.send("All its ok");
    //res.sendFile(__dirname + '/index.html');
});

// Carpeta para exponer los archivos
app.use('/media', express.static('media'));

/**
 * Socket de los clientes que reciben mensajes de un chat
 */

async function getSessions() {
    const whatsapps = await wpsessionController.getSessions();

    /**
     * Recorre todas las sesiones de whats
     * Inicializa sus cliente para usarlos
     */

    await Promise.all(whatsapps.map(async (whats, key) => {
        const newC = await wpsessionController.createClientV2(whats.id, whats.sessionAuth, whats.status);
        wpsessionController.initClientV2(newC, whats.sessionAuth, whats.id, whats.loadMessages);
        sesiones.addSession(newC);
        return newC;
    }));

}
getSessions();


/** Controller de envio massivo */
const massivemessageController = require('./Controllers/MassiveMessageController');

/**Modelo de mensajes */
const massiveMsg = require('./models').MassiveMessage;
/**
 * Envia los mensajes pendientes
 */
const sendMessages = new CronJob('* * * * *', async function () {

    let dEnd = new Date();
    //  dEnd.setHours(dEnd.getHours() + 1);
    dEnd = dEnd.toLocaleString('sv-SE', { timeZone: process.env.TZ || 'America/Lima' })

    let dIni = new Date();
    dIni.setHours(dIni.getHours() - 1);
    dIni = dIni.toLocaleString('sv-SE', { timeZone: process.env.TZ || 'America/Lima' });

    //console.log(`${dIni} ${dEnd}`);

    const messages = await massivemessageController.getPendingList({ dateIni: dIni, dateEnd: dEnd, status: 'Pendiente' });

    await Promise.all(messages.map(async (msg, key) => {
        //  console.log(msg);
        const msgMassive = await massiveMsg.findOne({ where: { id: msg.msgMassiveId } });
        const msgObj = { id: msg.msgMassiveId, contacts: [msg.contact], wpsession: msgMassive.wpId };

        await socketIO.sendMessage(msgObj);
    }))


}, null, true, process.env.TZ || 'America/Lima');



const sendProgramatedMessages = new CronJob('* * * * *', async function () {
    console.log("inicia envio masivo");
    let dEnd = new Date();
    //  dEnd.setHours(dEnd.getHours() + 1);
    if (process.env.TZ) {
        dEnd = dEnd.toLocaleString('sv-SE', { timeZone: process.env.TZ || 'America/Lima' })
    }


    let dIni = new Date();
    dIni.setHours(dIni.getHours() - 1);
    if (process.env.TZ) {
        dIni = dIni.toLocaleString('sv-SE', { timeZone: process.env.TZ || 'America/Lima' });
    }

    console.log(dIni, dEnd)
    const programatedMessages = await scheduleMsgController.getProgramatedMsgs(dIni, dEnd);
    //console.log(programatedMessages)


    await Promise.all(programatedMessages.map(async (msg, key) => {
        try {
            if (msg.dataValues.type == 'Mensaje') {
                const msgObj = { id: msg.dataValues.idMassive, contacts: msg.dataValues.contacts, wpsession: msg.dataValues.MassiveMessage.wpId };
                console.log(msgObj);
                await socketIO.sendMessage(msgObj);
            } else {

                const msgObj = { id: msg.dataValues.idMassive, contacts: msg.dataValues.contacts, from: msg.dataValues.MassiveMessage.twilioPhone.trim() };
                console.log(msgObj);
                await socketIO.sendCall(msgObj);
            }

        } catch (err) {
            console.log(err)
        }
    }))
}, null, true, process.env.TZ || 'America/Lima');



sendProgramatedMessages.start();



/**
 * Cierra de forma normal los clientes para que no fallen
 */
process.on("SIGINT", async () => {
    console.log("(SIGINT) Shutting down...");
    const ss = sesiones.getSessions();

    await Promise.all(Object.entries(ss).map(async (value, key) => {
        await value.destroy();
        console.log(`Cliente ${value} cerrado correctamente`);
        return true;
    }));


    process.exit(0);
})
