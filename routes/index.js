/** Controller de chat */
const chatController = require('../Controllers/ChatController');

/** Controller de sesiones */
const sessionController = require('../Controllers/SessionController');

/** Controller de login */
const loginController = require('../Controllers/LoginController');

/**controller usuarios */
const userController = require('../Controllers/UserController');

/**Controller de perfiles */
const profileController = require('../Controllers/ProfileController');

/** Controller de permisos */
const permissionController = require('../Controllers/PermissionController');

/** Controller de envio massivo */
const massivemessageController = require('../Controllers/MassiveMessageController');

/** Controller para webhooks */
const webhookController = require('../Controllers/WebhookController');

/** Controller para webhooks */
const tagController = require('../Controllers/TagsController');

/** Controller para webhooks */
const wordController = require('../Controllers/WordController');

/** Controller para plantilla de mensajes */
const messageTemplateController = require('../Controllers/MessageTemplate');

const groupController = require('../Controllers/GroupController');

const clientController = require('../Controllers/ClientController');

const twilioPhoneController = require('../Controllers/TwilioPhoneController');

const scheduleMsgController = require('../Controllers/ScheduleMsgController');

/** Middleware para validar JWT */
const auth = require('../middleware/auth');

/**
 * Subida de archivos
 */
const multer = require('multer')

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'media/')
    },
    filename: function (req, file, cb) {

        let re = /(?:\.([^.]+))?$/;

        let ext = re.exec(file.originalname)[1];
        // let nameArr = file.originalname.split('.');
        var reg = new RegExp('.' + ext, "g");
        let name = file.originalname.replace(reg, makeid(3));
        let newName = `${name}.${ext}`;

        console.log(name);
        cb(null, newName) //Appending .jpg
    }
})

const upload = multer({ storage: storage });

module.exports = (app) => {
    /**
    * Ruta del Login
    * No lleva middleware
    */
    app.post('/api/login', loginController.login);
    app.post('/api/getPermissions', auth, loginController.checkPermissions);

    /**
     * Ruta para la consulta de chats
     */
    app.post('/api/getChats', auth, chatController.getChats);
    app.post('/api/pinChat', auth, chatController.pinChat);
    app.post('/api/getContacts', auth, chatController.getContact)

    /**
     * Rutas para CRUD de sesiones
     */
    app.post('/api/getSessions', auth, sessionController.getSessionsService);
    app.post('/api/createSession', auth, sessionController.addSession);
    app.put('/api/deleteSession', auth, sessionController.deleteSession);
    app.post('/api/reconectSession', auth, sessionController.reconnectSession)

    /**
    * Rutas para CRUD de usuarios 
    */
    app.get('/api/users/all', auth, userController.getusers);
    app.post('/api/users/add', auth, userController.adduser);
    app.put('/api/users/del', auth, userController.deleteUser);

    /**
     * Rutas para CRUD de perfiles 
     */
    app.get('/api/profile/list', auth, profileController.getProfileList);
    app.get('/api/profile/all', auth, profileController.getProfiles);
    app.post('/api/profile/add', auth, profileController.addProfile);
    app.put('/api/profile/del', auth, profileController.deleteProfile);


    /**
    * Rutas para CRUD de permisos
    */
    app.get('/api/perm/list', auth, permissionController.getPermList);

    /**
     * Rutas para el envio masivo (consulta api)
     */
    app.post('/api/massive/list', auth, massivemessageController.getMassive);
    app.post('/api/massive/create', auth, massivemessageController.addMassive);
    app.post('/api/massive/listLite', massivemessageController.getMassiveLite);
    app.post('/api/massive/messagelistLite', massivemessageController.getMassiveMessagesLite);

    app.post('/api/massive/delete', auth, massivemessageController.deleteProfile);
    app.post('/api/massivemessage/udpate', auth, massivemessageController.updateGroup);
    /**
     * Sube un archivo y regresa la ruta
     */
    app.patch('/api/upload', upload.single('file'), function (req, res) {

        //console.log(req.file)
        return res.status(200).send({ status: "Success", fielName: req.file.filename });
    })

    app.post('/api/addFiles', auth, webhookController.addFiles)
    app.post('/api/addFilesWebhook', auth, webhookController.addWebhookFiles)
    app.post('/api/removeFilesWebhook', auth, webhookController.removeWebhookFiles)
    app.post('/api/addFilesMsg', auth, massivemessageController.addMsgFiles)
    app.post('/api/removeFilesMsg', auth, massivemessageController.removeMsgFiles)

    /**
     * Operaciones para webhooks
     * Incluye la petición externa, esta no lleva auth
     */
    app.post('/api/getWebhook', auth, webhookController.getWebhooks);
    app.post('/api/createWebhook', auth, webhookController.addWebhook);
    app.put('/api/deleteWebhook', auth, webhookController.deleteWebhook);
    app.post('/api/whlogUpdate', auth, webhookController.updateWebhookPhone);
    app.post('/api/msgListUpdate', auth, webhookController.updateMsgListPhone);
    app.post('/api/addWhSchedule', auth, webhookController.addWebhookSchedule);
    app.post('/api/removeWhSchedule', auth, webhookController.removeWebhookSchedule);
    app.post('/api/editWebhook', auth, webhookController.editWebhook);


    app.post('/api/webhookPetition/:token', webhookController.tokenRequest);

    /**
 * Operaciones para tags
 */
    app.post('/api/getTags', auth, tagController.getTags);
    app.post('/api/createTag', auth, tagController.addTag);
    app.put('/api/deleteTag', auth, tagController.deleteTag);
    app.post('/api/addTagToClient', auth, tagController.addTagToClient)
    app.post('/api/removeTagFromClient', auth, tagController.removeTagFromClient)


    /**
     * Operaciones de grupos
     */
    app.post('/api/createGroup', auth, groupController.createGroup)
    app.post('/api/getGroups', auth, groupController.get)


    /**
    * Operaciones de clientes
    */
    app.post('/api/getClients', auth, clientController.getClients)
    /**
   * Operaciones de clientes
   */
    app.post('/api/updateClient', auth, clientController.updateClient)
    app.post('/api/callCLient', auth, clientController.callCLient)


    /**
     * Operaciones para speechs
     */
    app.post('/api/getSpeech', auth, wordController.getWords);
    app.post('/api/createSpeech', auth, wordController.addWord);
    app.put('/api/deleteSpeech', auth, wordController.deletWord);

    /**
     * Operaciones para los templates
     */
    app.post('/api/getTemplate', auth, messageTemplateController.getTemplate);
    app.post('/api/createTemplate', auth, messageTemplateController.addTemplate);
    app.put('/api/deleteTemplate', auth, messageTemplateController.deleteTemplate);
    app.post('/api/addTempFile', auth, messageTemplateController.addFiles);
    app.post('/api/removeTempFile', auth, messageTemplateController.removeFiles);

    /**
     * Operaciones para los teléfonos de twilio
     */
    app.post('/api/getTwilioPhones', auth, twilioPhoneController.getPhones);
    app.post('/api/createTwilioPhone', auth, twilioPhoneController.create);
    app.put('/api/deleteTwilio', auth, twilioPhoneController.delete);

    /**
     * Opciones para la porgramación de mensajes
     */
    app.post('/api/getSchedules', auth, scheduleMsgController.get);
    app.post('/api/createSchedule', auth, scheduleMsgController.add);
    app.put('/api/deleteSchedule', auth, scheduleMsgController.delete);

}
