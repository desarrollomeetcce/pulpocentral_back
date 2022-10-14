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


        let {group,clients,advisers} = req.body;
        /**
         * Busca los tags, si no existen regresa un arreglo vacio
         */
        try {

            let clientsCount = clients.length;
            
            let newGroup = null;

            if(group){
                group.membersCount = clientsCount
                newGroup = await groupModel.create(group);
            }
           
            
            if(advisers.length > 0){
                let adCount = advisers.length;
                
              
                if(clientsCount >= adCount){
                    let repCount = clientsCount/adCount;
                    let staticCount = repCount;
                    let iniCount = 0;

                    

                    for(let i = 0; i< advisers.length; i++){
                        let tempCLientArr = clients.slice(iniCount,repCount);
             
                         tempCLientArr = clients.slice(iniCount,repCount);

                        
                        for(let j = 0; j<tempCLientArr.length;j++){
                            try{
                                let client = tempCLientArr[j];
                                client.adviser = advisers[i].id;
                                if(group){
                                    client.groupId = newGroup.id;
                                }
                              
                               // delete client.id;
                              
                                if(client.id && client?.id !== 0){
                                    await clientsModel.update({adviser: advisers[i].id},{where: {id: client.id}})
                                }else{
                                    await clientsModel.create(client)
                                }
                                
                            }catch(err){
                               
                                console.log(err);
                            
                            }
                        }
                        iniCount = repCount;
                        repCount +=staticCount;
                    }
                }
            }else{
                await Promise.all(clients.map(async (client)=>{
                    client.groupId = newGroup.id;
                    
                    try{
                        return await clientsModel.create(client)
                    }catch(err){
                       
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


};