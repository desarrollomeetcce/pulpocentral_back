const groupModel = require("../models").Group;

const history = require('./HistoricoController');
const clientsModel = require('../models/').Client;

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
    async createGroup(req, res) {
        /**
         * Variables para guardar los mensaje y el historial
         */
        let arrMsg = [];
        let historyObj = {};


        let { group, clients, advisers } = req.body;
        /**
         * Busca los tags, si no existen regresa un arreglo vacio
         */
        try {

            let clientsCount = clients.length;

            let newGroup = null;

            if (group) {
                group.membersCount = clientsCount
                newGroup = await groupModel.create(group);
            }


            if (advisers.length > 0) {
                let adCount = advisers.length;


                if (clientsCount >= adCount) {
                    let repCount = clientsCount / adCount;
                    let staticCount = repCount;
                    let iniCount = 0;



                    for (let i = 0; i < advisers.length; i++) {
                        let tempCLientArr = clients.slice(iniCount, repCount);

                        tempCLientArr = clients.slice(iniCount, repCount);


                        for (let j = 0; j < tempCLientArr.length; j++) {
                            try {
                                let client = tempCLientArr[j];
                                client.adviser = advisers[i].id;
                                if (group) {
                                    client.groupId = newGroup.id;
                                }

                                // delete client.id;

                                if (client.id && client?.id !== 0) {
                                    await clientsModel.update({ adviser: advisers[i].id }, { where: { id: client.id } })
                                } else {
                                    client.status=1;
                                    await clientsModel.create(client)
                                }

                            } catch (err) {

                                console.log(err);

                            }
                        }
                        iniCount = repCount;
                        repCount += staticCount;
                    }
                }
            } else {
                await Promise.all(clients.map(async (client) => {
                    client.groupId = newGroup.id;

                    try {
                        return await clientsModel.create(client)
                    } catch (err) {

                        console.log(err);
                        return false;
                    }

                }))
            }




            return res.status(200).send({ status: "Success", clientsCount: clients.length, group: newGroup });

        } catch (err) {
            //Registra el movimiento el la tabla userlogs
            historyObj.user = 'SystemRoot';
            historyObj.changeType = 'CreateGroupError';
            historyObj.description = `Err:  ${err.message}`;
            history.regHistory(historyObj);

            arrMsg.push(err.message);

            return res.status(200).send({ status: "Error", msg: arrMsg });
        }
    },
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
            const groups = await groupModel.findAll({

            });
            return res.status(200).send({ status: 'Success', groups: groups });

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
            const groups = await groupModel.findAll({
                attributes: ['id', 'name'],
            });
            return res.status(200).send({ status: 'Success', groups: groups });

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

            await Promise.all(groups.map(async (database) => {

                try {
                    await groupModel.destroy({
                        where: {
                            id: database.id
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
 * Combina una o mas una grupos
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
    async merge(req, res) {
        let arrMsg = [];


        const { groups, newName } = req.body;


        try {
            const newIdGroup = groups[0].id;
            let membersCount = 0;


            await Promise.all(groups.map(async (database, index) => {
                console.log(index);
                if (index > 0) {
                    try {

                        await clientsModel.update(
                            { groupId: newIdGroup },
                            { where: { groupId: database.id } }
                        )
                        await groupModel.destroy({
                            where: {
                                id: database.id
                            }
                        })
                        membersCount += database.membersCount;
                    } catch (err) {
                        console.log(err);
                    }
                }

                return true;
            }))
            const clientsCount = await clientsModel.findAll({
                where: {
                    groupId: newIdGroup
                }
            })
            membersCount = clientsCount.length;

            await groupModel.update(
                { name: newName, membersCount: membersCount },
                {
                    where: {
                        id: newIdGroup
                    }
                })


            return res.status(200).send({ status: 'Success' });

        } catch (err) {

            arrMsg.push('Ocurrio un error al eliminar los grupos');
            arrMsg.push(err.message);
            return res.status(200).send({ status: 'error', msg: arrMsg });
        }
    },
    /**
     * Mueve uno o mas clientes a otro grupo
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async move(req, res) {
        let arrMsg = [];


        const { clients, newID, oldID } = req.body;


        try {

            let membersCount = 0;


            await Promise.all(clients.map(async (client, index) => {


                try {

                    await clientsModel.update(
                        { groupId: newID },
                        { where: { id: client.id } }
                    )

                } catch (err) {
                    console.log(err);
                }


                return true;
            }))

            const clientsCount = await clientsModel.findAll({
                where: {
                    groupId: newID
                }
            })
            membersCount = clientsCount.length;

            await groupModel.update(
                {membersCount: membersCount },
                {
                    where: {
                        id: newID
                    }
                })

            const clientsCountOld = await clientsModel.findAll({
                where: {
                    groupId: oldID
                }
            })
            let membersCountOld = clientsCountOld.length;

            await groupModel.update(
                { membersCount: membersCountOld },
                {
                    where: {
                        id: oldID
                    }
                })


            return res.status(200).send({ status: 'Success' });

        } catch (err) {

            arrMsg.push('Ocurrio un error al eliminar los grupos');
            arrMsg.push(err.message);
            return res.status(200).send({ status: 'error', msg: arrMsg });
        }
    },
};