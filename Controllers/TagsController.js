const tagsModel = require("../models").Tag;

const history = require('./HistoricoController');
const wpsession = require('../models/').WpSession;
const chattagrelation = require('../models').ClientTagsRelation;

/**
 * Controlador para manejar los datos de las sesiones de wp
 * servicios web
 */
module.exports = {

    /**
     * Obtiene los tags actuales
     * @param {*} req 
     * @param {*} res 
     */
    async getTags(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        

        /**
         * Busca los tags, si no existen regresa un arreglo vacio
         */
        try {
            const tags = await tagsModel.findAll({});
            return res.status(200).send({ status: "Success", count: tags.length, tags: tags });

        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'GetTagsError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },

    /**
    * Crea o actualiza un tag
    * @param {*} req 
    * @param {*} res 
    */
    async addTag(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Obtiene los datos para crear un nuevo webhook
         * Si viene el id reemplaza los existentes
         */

        const { id, tagObj } = req.body;

        try {
            delete tagObj.id;

            if (id) {

                const updated = await tagsModel.update(
                    tagObj,
                    { where: { id: id } }
                )
                arrMsg.push(`Tag actualizado ${updated} ${id}`);



                return res.status(200).send({ status: "Success", msg: arrMsg });
            } else {



                const newTag = await tagsModel.create(tagObj);

                arrMsg.push(`Tag creado ${newTag.id}`);
                arrMsg.push(newTag);

                return res.status(200).send({ status: "Success", msg: arrMsg });
            }



        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'CreateTagError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
    /**
    * Agrega tags a los chats
    * @param {*} req 
    * @param {*} res 
    */
    async addTagToClient(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Obtiene los datos para crear un nuevo webhook
         * Si viene el id reemplaza los existentes
         */

        const { clientId, idTags } = req.body;



        try {



            await Promise.all(idTags.map(async (idTag, key) => {

                try {
                    await chattagrelation.create(
                        {
                            clientId: clientId,
                            tagId: idTag
                        }
                    )

                    return true;
                } catch (err) {
                    console.log(err)
                    arrMsg.push(`${err.message} chat ${clientId} tag ${idTag}`);
                    return false
                }
            }))



            arrMsg.push(`Se agregaron las etiquetas`)
            return res.status(200).send({ status: "Success", msg: arrMsg });



        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'CreateTagError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
    /**
    * Elimina tags a los chats
    * @param {*} req 
    * @param {*} res 
    */
    async removeTagFromClient(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Obtiene los datos para crear un nuevo webhook
         * Si viene el id reemplaza los existentes
         */

        const { clientId, idTags } = req.body;



        try {




            try {
                await chattagrelation.destroy(
                    {
                        where: {
                            clientId: clientId,
                            tagId: idTags
                        }
                    }
                )
            } catch (err) {
                console.log(err)
                arrMsg.push(`${err.message} chat ${clientId} tag ${idTag}`);
                return false
            }




            arrMsg.push(`Se eliominaron las etiquetas las etiquetas`)
            return res.status(200).send({ status: "Success", msg: arrMsg });



        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'RemoveTagError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
    /**
     * Elimina un tag
     * @param {*} req 
     * @param {*} res 
     */
    async deleteTag(req, res) {
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
                const tagTemp = await tagsModel.findOne(
                    { where: { id: id } }
                )


                const deleted = await tagsModel.destroy(
                    { where: { id: id } }
                )

                if (deleted == 1) {
                    arrMsg.push(`Wp Eliminado ${tagTemp.name} ${deleted} ${id}`);

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
            historyObj.changeType = 'DelteTagError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },

};