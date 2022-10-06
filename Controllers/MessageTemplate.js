const messageTemplateModel = require("../models").MessageTemplate;
const fileModel = require("../models").File;
const templatefileRelation =  require("../models").TemplateFileRelation
const history = require('./HistoricoController');
const msgwordrelation = require('../models').TemplateWordRelation;
const wordModel = require('../models').Word;

/**
 * Controlador para manejar los datos de las sesiones de wp
 * servicios web
 */
module.exports = {

    /**
     * Obtiene la lista de mensajes para template
     * @param {*} req 
     * @param {*} res 
     */
    async getTemplate(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        const { wpSessions } = req.body;

        let filter = {}

        /**
         * Busca las plantillas de mensajes, si no existen regresa un arreglo vacio
         */
        try {
            const messageTemplates = await messageTemplateModel.findAll({
                    where: filter,
                    include:[
                        {
                            model:fileModel,
                        },
                        {
                            model: wordModel,
                        }
                    ],
            },);


            await Promise.all(messageTemplates.map(async (wb, key) => {
                let newWords = [];
                // console.log(wb);
                wb.dataValues.Words.map((word, key) => {
                    newWords.push(word.id);
                })

 
                wb.dataValues.words = newWords;
                return true;

            }))

            return res.status(200).send({ status: "Success", messageTemplates: messageTemplates.length, messageTemplates: messageTemplates });
        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'GeMessageTemplateError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);
            console.log(err);
            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },

    /**
    * Crea o actualiza una plantilla
    * @param {*} req 
    * @param {*} res 
    */
    async addTemplate(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Obtiene los datos para crear una nueva relacion de palabras
         * Si viene el id reemplaza los existentes
         */

        const { id, templateObj,words } = req.body;

        try {
            delete templateObj.id;

            if (id) {

                const updated = await messageTemplateModel.update(
                    templateObj,
                    { where: { id: id } }
                )
                arrMsg.push(`Template actualizado ${updated} ${id}`);

                await msgwordrelation.destroy({ where: { messageTemplateId: id } });

                if (updated) {
                    words?.map(async (word, key) => {
                        await msgwordrelation.create({ messageTemplateId: id, wordId: word });
                    })

                    return res.status(200).send({ status: "Success", msg: arrMsg });
                }

                if (updated) {
                    return res.status(200).send({ status: "Success", msg: arrMsg });
                } else {
                    arrMsg.push(`El template no exitste`);
                    return res.status(200).send({ status: "Error", msg: arrMsg });
                }



            } else {

                let newTemplateTemp = { ...templateObj }

                const newTemplate = await messageTemplateModel.create(newTemplateTemp);

                words?.map(async (word, key) => {

                    try{
                        await msgwordrelation.create({ messageTemplateId: newTemplate.id, wordId: word });
                    }catch(err){
                        console.log(err);
                    }
                    
                })


                arrMsg.push(`Template creado ${newTemplate.id}`);
                arrMsg.push(newTemplate);

                return res.status(200).send({ status: "Success", msg: arrMsg,template: newTemplate });
            }



        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'CreateTemplateError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);
            console.log(err);
            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
    /**
     * Elimina una plantilla
     * @param {*} req 
     * @param {*} res 
     */
    async deleteTemplate(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Obtiene el id de la plantilla
         */

        const { id } = req.body;

        try {

            if (id) {
                const templateTemp = await messageTemplateModel.findOne(
                    { where: { id: id } }
                )


                const deleted = await messageTemplateModel.destroy(
                    { where: { id: id } }
                )
                
                await msgwordrelation.destroy({ where: { messageTemplateId: id } });

                if (deleted == 1) {
                    arrMsg.push(`Template Eliminado ${templateTemp.name} ${deleted} ${id}`);

                    return res.status(200).send({ status: "Success", msg: arrMsg });

                } else {
                    arrMsg.push(`Error, no existe el tempalte`);
                    return res.status(200).send({ status: "Error", msg: arrMsg });
                }

            } else {

                arrMsg.push(`El id es requerido`);
                return res.status(200).send({ status: "Error", msg: arrMsg });
            }



        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'DelteTemplateError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
    /**
     * Agrega la relacion de archivos y el templaet
     * @param {*} req 
     * @param {*} res 
     */
     async addFiles(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        const { id,files } = req.body;

        /**
         * Agrega todos los archivos en la tabal de files
         */

        try {
           

            let filesArr = [];

            await Promise.all(files.map(async (fileId,key)=>{
                try{
                  
                    await templatefileRelation.create({ messagetemplateId: id, fileId: fileId });
                    return true;
                }catch(err){
                    console.log(err);
                    return false;
                }
            }))

           // console.log(files);
            return res.status(200).send({ status: "Success", count: filesArr.length, files: filesArr });
        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'AddFileTemplateMsgError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },

     /**
     * Elimina la relacion de archivos y el template
     * @param {*} req 
     * @param {*} res 
     */
    async removeFiles(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        const { id,files } = req.body;

        /**
         * Elimina los archivos del webhook
         */

        try {
           

            let filesArr = [];

            await Promise.all(files.map(async (fileId,key)=>{
                try{
                  
                    await templatefileRelation.destroy({ where: {messagetemplateId: id, fileId: fileId }});
                    return true;
                }catch(err){
                    console.log(err);
                    return false;
                }
            }))

           // console.log(files);
            return res.status(200).send({ status: "Success", count: filesArr.length, files: filesArr });
        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'RemoveFileTemplateError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },

    
};