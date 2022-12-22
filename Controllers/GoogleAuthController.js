const userAuth = require("../models").UserAuth;
const userModel = require("../models").User;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
//const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

const history = require('./HistoricoController');


const {
    OAuth2Client,
} = require('google-auth-library');


const oAuth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'postmessage',
);

async function listFiles(authClient) {
    const drive = google.drive({ version: 'v3', auth: authClient });


    const res = await drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
    });
    const files = res.data.files;
    if (files.length === 0) {
        console.log('No files found.');
        return;
    }

    console.log('Files:');
    files.map((file) => {
        console.log(`${file.name} (${file.id})`);
    });
}

/**
 * Metodo para regresar el JSON para la sesión de google
 * @param {*} userAuthObj 
 * @returns 
 */
const getSesionJson = (userAuthObj) => {

    const userAuthJSON = {
        type: userAuthObj.type,
        client_id: userAuthObj.client_id,
        client_secret: userAuthObj.client_secret,
        refresh_token: userAuthObj.refresh_token
    }

    return userAuthJSON;
}
/**
 * Controlador para manejar los datos de las sesiones de google
 * 
 */
module.exports = {

    /**
     * Crea los datos para usar la sesión
     * @param {*} req 
     * @param {*} res 
     */
    async create(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        let { id, clientData } = req.body;
        /**
         * Busca los tags, si no existen regresa un arreglo vacio
         */
        try {

            if (id) {

                const content = await fs.readFile(CREDENTIALS_PATH);
                const keys = JSON.parse(content);
                const key = keys.installed || keys.web;

                const userSesion = await userAuth.create({ ...clientData, type: 'authorized_user' });

                const userAuthJSON = getSesionJson(userSesion);

                const client = google.auth.fromJSON(userAuthJSON)

                const newToken = await client.getAccessToken();

                return res.status(200).send({ status: "Success", token: newToken.token });
            } else {
                arrMsg.push(`El id de usuario es requerido`)
                return res.status(200).send({ status: "Error", arrMsg });
            }

        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'CreateUserAuthError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },

    /**
     * Crea los datos para usar la sesión
     * @param {*} req 
     * @param {*} res 
     */
    async auth(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        const { id } = req.body;
        /**
         * Busca los tags, si no existen regresa un arreglo vacio
         */
        try {
            const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens
            // console.log(tokens);
            oAuth2Client.setCredentials(tokens);

            await userModel.update({ authToken: JSON.stringify(tokens) }, { where: { id: id } })

            // listFiles(oAuth2Client);

            res.status(200).json(tokens.access_token);
        } catch (err) {
            console.log(err)
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'CreateUserAuthError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
    async getSheetData(req, res) {

        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        let { id, sheetId, sheetPage } = req.body;
        /**
         * Busca los tags, si no existen regresa un arreglo vacio
         */
        try {

            const userData = await userModel.findOne({
                where: { id: id }
            })

            oAuth2Client.setCredentials(JSON.parse(userData.dataValues.authToken));

            const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

            const sheetRes = await sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range: sheetPage + '!A1:H',
            });

            const rows = sheetRes.data.values;

            if (!rows || rows.length === 0) {
                arrMsg.push('La hoja no tiene información');
                return res.status(200).send({ status: "Error", msg: arrMsg });

            }

            return res.status(200).send({ status: "Success", msg: arrMsg, rows: rows });

        } catch (err) {
            // console.log(err)
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'GetSheetError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }

    }

};