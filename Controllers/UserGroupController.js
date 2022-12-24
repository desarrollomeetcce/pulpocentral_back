const userGroupModel = require("../models").UserGroup;
const groupModel = require("../models").Group;

const history = require('./HistoricoController');
const clientsModel = require('../models/').Client;


/**
 * Convierte el objeto enviado por la hoja de google en un nuevo cliente
 * @param {*} databaseID 
 * @param {*} sheetData 
 * @param {*} defaultStructure 
 * @returns 
 */
const convertObjectSheetToClient = (databaseID, sheetData, defaultStructure) => {

    try {

        const newClient = {};

        Object.keys(defaultStructure).map((field) => {
            newClient[defaultStructure[field].localColName] = sheetData[field];
        })

        newClient.groupId = databaseID;

        return newClient;

    } catch (err) {
        console.log(err);
        return null;
    }
}
/**
 * Controlador para manejar los datos de las sesiones de wp
 * servicios web
 */
module.exports = {


    /**
     * Regresa un lista de los grupos tambien llamados base de datos
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async get(req, res) {
        let arrMsg = [];

        try {
            /**
             * Consulta todos los grupos
             * 
             */
            const userGroups = await userGroupModel.findAll({
            });
            return res.status(200).send({ status: 'Success', userGroups: userGroups });

        } catch (err) {

            arrMsg.push('Ocurrio un error al consultar los grupos');
            arrMsg.push(err.message);
            return res.status(200).send({ status: 'error', msg: arrMsg });
        }
    },
    /**
     * Regresa un lista de los grupos tambien llamados base de datos
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async getByID(req, res) {
        let arrMsg = [];

        try {
            /**
             * Consulta todos los grupos
             * 
             */
            const userGroups = await userGroupModel.findAll({
                where: {
                    id: id
                }
            });
            return res.status(200).send({ status: 'Success', userGroups: userGroups });

        } catch (err) {

            arrMsg.push('Ocurrio un error al consultar los grupos');
            arrMsg.push(err.message);
            return res.status(200).send({ status: 'error', msg: arrMsg });
        }
    },
    /**
     * Regresa un lista de los grupos tambien llamados base de datos
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async getList(req, res) {
        let arrMsg = [];

        try {
            /**
             * Consulta todos los grupos
             * 
             */
            const userGroups = await userGroupModel.findAll({
                //attributes: ['id', 'name'],
            });
            return res.status(200).send({ status: 'Success', userGroups: userGroups });

        } catch (err) {

            arrMsg.push('Ocurrio un error al consultar los grupos');
            arrMsg.push(err.message);
            return res.status(200).send({ status: 'error', msg: arrMsg });
        }
    },
    /**
     * Elimina una lista de grupos
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async delete(req, res) {
        let arrMsg = [];


        const { groups } = req.body;


        try {

            await Promise.all(groups.map(async (userGroup) => {

                try {
                    await userGroupModel.destroy({
                        where: {
                            id: userGroup.id
                        }
                    })
                } catch (err) {
                    console.log(err);
                }


                return true;
            }))

            return res.status(200).send({ status: 'Success' });

        } catch (err) {

            arrMsg.push('Ocurrio un error al eliminar los grupos');
            arrMsg.push(err.message);
            return res.status(200).send({ status: 'error', msg: arrMsg });
        }
    },

    /**
    * Registra las bases de datos dentro de la hoja
    * @param {*} req 
    * @param {*} res 
    */
    async tokenSheetReg(req, res) {

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
         * Lo imporante es el sheetData
         */

        const { sheetID, sheetNames } = req.body;

       
        
        

        const defaultStructure = {
            "A": { localColName: "firstName", simpleName: "Nombre" },
            "B": { localColName: "lastName", simpleName: "Apellidos" },
            "C": { localColName: "country", simpleName: "País" },
            "D": { localColName: "city", simpleName: "Ciudad" },
            "E": { localColName: "gender", simpleName: "Género" },
            "F": { localColName: "level", simpleName: "Nivel educativo" },
            "G": { localColName: "phone", simpleName: "Teléfono" },
        }


        try {
            /**
             * Consulta si existe un grupo con ese token 
             */
            const userGroupDatavalues = await userGroupModel.findOne({
                where: {
                    token: token
                }
            });

            const userGroup = userGroupDatavalues.dataValues;

            if (!userGroup?.id) {
                return res.status(200).send({ status: "Error", msg: 'El token no es valido' });
            }

            let count = 0;

            console.log(sheetID)
            console.log(sheetNames)
            console.log(JSON.parse(sheetNames))
            console.log(Array.from(sheetNames))

            await Promise.all(sheetNames.map(async (sheetName) => {

                try {
                    let currentDatabase = {};
                    /**
                     * Busca si existe la base de datos
                     */
                    currentDatabase = await groupModel.findOne({
                        where: {
                            name: sheetName,
                            sheetId: sheetID,
                            userGroupId: userGroup.id
                        }
                    });

                    if (!currentDatabase) {
                        currentDatabase = await groupModel.create({
                            name: sheetName,
                            sheetId: sheetID,
                            userGroupId: userGroup.id,
                            membersCount: 0,
                            columnsStructure: JSON.stringify(defaultStructure)
                        });


                    }

                    count++;
                } catch (err) {
                    console.log(err);
                }

                return true;
            }))

            return res.status(200).send({ status: "Success", msg: `Se sincronizaron ${count} hojas`});
        } catch (err) {
            console.log(err);
            return res.status(200).send({ status: "Error", msg: err.message});
        }

    },
    /**
     * Método que recibe la petición de la hoja de google
     * No lleva validación
     * @param {*} req 
     * @param {*} res 
     */
    async tokenSheetRequest(req, res) {

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
         * Lo imporante es el sheetData
         */

        const { sheetID, sheetData, sheetName } = req.body;



        try {


            /**
             * Consulta si existe un grupo con ese token 
             */
            const userGroupDatavalues = await userGroupModel.findOne({
                where: {
                    token: token
                }
            });

            const userGroup = userGroupDatavalues.dataValues;

            if (!userGroup?.id) {
                return res.status(200).send({ status: "Error", msg: 'El token no es valido' });
            }


            let currentDatabase = {};
            /**
             * Busca si existe la base de datos
             */
            currentDatabase = await groupModel.findOne({
                where: {
                    name: sheetName,
                    sheetId: sheetID,
                    userGroupId: userGroup.id
                }
            });

            if (!currentDatabase) {
                return res.status(200).send({ status: "Error", msg: 'No existe la base de datos',database: {
                    name: sheetName,
                    sheetId: sheetID,
                    userGroupId: userGroup.id
                } });
            }

            currentDatabase = currentDatabase.dataValues;


            const newClient = convertObjectSheetToClient(currentDatabase.id, sheetData, JSON.parse(currentDatabase.columnsStructure));

            if (!newClient) {
                return res.status(200).send({ status: "Error", msg: 'No se logró generar el cliente' });
            }

           
            const createdClient = await clientsModel.create(newClient);

            const memCount = currentDatabase.membersCount;

            await groupModel.update({membersCount: memCount+1},{where:{id: currentDatabase.id}})

            return res.status(200).send({ status: "Success", msg: 'Se registro el cliente con exito', client: createdClient });



        } catch (err) {
            console.log(err);
            return res.status(200).send({ status: "Error", msg: err.message });
        }

    }

};