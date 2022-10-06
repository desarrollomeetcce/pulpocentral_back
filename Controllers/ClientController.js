
const clientsModel = require('../models/').Client;
const commentModel = require('../models/').Comment;
const tagModel = require('../models/').Tag;
const userModel = require('../models/').User;
const clientCommentR = require('../models/').ClientCommentRelation;
const clientTagR = require('../models/').ClientTagRelation;
const history = require('./HistoricoController');

const accountSid = "AC0aee570a295ef12de9105ae2b418a40a";
const authToken = "d4fdaa5a8ac9744d13471d83a0bd84f8";
const client = require('twilio')(accountSid, authToken);

const Sequelize = require('sequelize');
const { CompositionSettingsList } = require('twilio/lib/rest/video/v1/compositionSettings');
const Op = Sequelize.Op;


async function call(number) {
    try {
        const resp = await client.calls.create({
            url: 'https://pulpo.sfo3.digitaloceanspaces.com/twilio/test.xml',
            to: number,
            from: '+19787055002',
            method: 'GET'
        })
        return resp;

    } catch (err) {
        console.log(err);
        return err;
    }
}

/**
 * Controlador para manejar los datos de clientes 
 * servicios web
 */
module.exports = {

    /**
     * Crea la sesion y valida si tiene permisos sobre algún wp
     * @param {*} req 
     * @param {*} res 
     */
    async getClients(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        const { adviser,filters } = req.body;

        
        /**
         * Busca las sessiones, si no existen regresa un arreglo vacio
         */
        try {

            let filter = {};


           
            if( filters ){
                Object.keys(filters).map((key)=>{
                    if(filters[key] == '' || filters[key] == []){
                        return false;
                    }
                    if(typeof(filters[key]) === "string"){
                        filter[key] ={[Op.like]: `%${filters[key]}%`}
                        
                    }else{
                        filter[key] = filters[key];
                    }
                })
               
            }
            if(adviser){
                filter.adviser = adviser;
                
            }
            console.log(req.body);
            console.log(filter);

            
            const clients = await clientsModel.findAll(
                {
                    where: filter,
                    include: [
                        {
                            model: commentModel,

                        },
                        {
                            model: tagModel,

                        },
                        {
                            model: userModel,
                            attributes: ['id','firstName']
                        }
                    ],
                }
            );


            return res.status(200).send({ status: "Success", clients: clients });
        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'CreateClientError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(`El password es requerido`);
            arrMsg.push(err.message);

            console.log(err);

            return res.status(200).send({ status: "Error", err: err });
        }
    },

    /**
   * Crea la sesion y valida si tiene permisos sobre algún wp
   * @param {*} req 
   * @param {*} res 
   */
    async updateClient(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        const { client, comments, tags, id } = req.body;
        /**
         * Busca las sessiones, si no existen regresa un arreglo vacio
         */
        try {

            const clientUpdated = await clientsModel.update(
                client,
                { where: { id: id } },
            );


            const commentsRelation = await clientCommentR.findAll({ where: { clientId: id } })

            Promise.all(commentsRelation.map(async (clientComment) => {
                try {
                    await commentModel.destroy({ where: { id: clientComment.commentId } });
                } catch (err) {
                    console.log(err);
                }
                return true;
            }))

            await clientCommentR.destroy({ where: { clientId: id } });

            await clientTagR.destroy({ where: { clientId: id } });

            comments.map(async (comment) => {
                try {
                    const newComment = await commentModel.create({ comments: comment });

                    await clientCommentR.create({ clientId: id, commentId: newComment.id });
                } catch (err) {
                    console.log(err);
                }

                return true;
            })

            tags.map(async (tag) => {
                try {
                   
                    await clientTagR.create({ clientId: id, tagId: tag });
                } catch (err) {
                    console.log(err);
                }

                return true;
            })

            return res.status(200).send({ status: "Success", client: clientUpdated });
        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'CreateClientError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(`El password es requerido`);
            arrMsg.push(err.message);
            console.log(err);

            return res.status(200).send({ status: "Error", err: err });
        }
    },

    async callCLient(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        const { phone } = req.body;
        /**
         * Busca las sessiones, si no existen regresa un arreglo vacio
         */
        try {


            await call(phone);
            return res.status(200).send({ status: "Success", clients: clients });
        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'CreateClientError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(`El password es requerido`);
            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", err: err });
        }
    },
    /**
     * Crea la instancia de un cliente 
     */
    initClient(client, socket) {

        client.on('message', message => {
            console.log(message.body);
            socket.emit('NEW_MESSAGE', message);
        });
    }
};