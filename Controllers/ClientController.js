
const clientsModel = require('../models/').Client;
const commentModel = require('../models/').Comment;
const tagModel = require('../models/').Tag;
const userModel = require('../models/').User;
const clientCommentR = require('../models/').ClientCommentRelation;
const clientTagR = require('../models/').ClientTagRelation;
const history = require('./HistoricoController');
const massivemessagelist = require('../models').MassiveMessageList;
const statusModel = require('../models').Status;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;



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
            
            const clients = await clientsModel.findAll(
                {
                    where: filter,
                    include: [
                        {
                            model: commentModel,

                        },
                        {
                            model: statusModel
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
            
            await Promise.all(clients.map(async (client)=>{
                const statusList = await massivemessagelist.findAll(
                    {
                        offset: 3, limit: 3,
                        where: {contact: client.dataValues.phone},
                        order: [
                            // Will escape full_name and validate DESC against a list of valid direction parameters
                            ['updatedAt', 'DESC']
                        ]
                    }
                );
                   // console.log(statusList)
                statusList.map((status,index)=>{
                    client.dataValues[`statusLlamada${index}`] = status.dataValues.twilioStatus;
                    client.dataValues[`statusMensaje${index}`] = status.dataValues.status;
                })
                return true;
               
            }))

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