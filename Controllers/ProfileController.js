const profile = require('../models').Profile;
const permission = require('../models').Permission;
const wpsession = require('../models').WpSession;
const twilioPhone = require('../models').TwilioPhone;
const history = require('./HistoricoController');
const permProfileRelation = require('../models').PermProfileRelation;
const wpProfileRelation = require('../models').WpProfileRelation;
const twilioProfileRelation = require('../models').TwilioProfileRelation;

const userModel = require('../models').User;

module.exports = {
    /**
     * Retorna un objeto con todos los permisos
     * @param {*} req 
     * @param {*} resp 
     * @returns 
     */
    async getProfileList(req, res) {
        let arrMsg = [];

        try {
            /**
             * Consulta todos los perfiles
             * no incluye su relacion
             */
            const profiles = await profile.findAll({
                attributes: { exclude: ['createdAt', 'updatedAt', 'description'] },
            });
            return res.status(200).send({ status: 'Success', profiles: profiles });

        } catch (err) {

            arrMsg.push('Ocurrio un error al consultar los perfiles');
            arrMsg.push(err.message);
            return res.status(200).send({ status: 'error', msg: arrMsg });
        }
    },
    /**
     * Regresa un lista de los perfiles con su relacion de permisos y sistemas
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async getProfiles(req, res) {
        let arrMsg = [];

        try {
            /**
             * Consulta todos los perfiles
             * Incluye toda su relacion
             */
            const profiles = await profile.findAll({
                include: [
                    { model: permission },
                    { model: wpsession },
                    { model: twilioPhone }
                ]
            });
            return res.status(200).send({ status: 'Success', profiles: profiles });

        } catch (err) {

            arrMsg.push('Ocurrio un error al consultar los perfiles');
            arrMsg.push(err.message);
            return res.status(200).send({ status: 'error', msg: arrMsg });
        }
    },
    /**
     * Agrega o actualiza un perfil
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async addProfile(req, res) {
        let arrMsg = [];
        let historyObj = {};

        const { id, profileObj, permissions, wpsessions, twilioPhones } = req.body;


        /**
         * Si el id no es nulo entonces actualiza el perfil
         * sino lo crea
         */
        if (id) {

            try {
                const profileUPdated = await profile.update(
                    profileObj,
                    { where: { id: id } },
                );

                /**
                 * Variables para contar cuantos permisos se agregaron
                 */
                let permissionSuccess = 0, permissionError = 0;

                /**
                 * Variables para contar cuantos sistemas se agregaron
                 */
                let systemSuccess = 0, systemError = 0;

                /**
                * Variables para contar cuantos sistemas se agregaron
                */
                let twilioPhonesSuccess = 0, twilioPhonesError = 0;

                /**
                 * Valida si se actualizó
                 */
                if (profileUPdated == 1) {
                    arrMsg.push(`Se actualizó el perfil correctamente`);

                    try {
                        if (permissions) {
                            /**
                             * Elimina todos los permisos para agregar los nuevos
                             */
                            await permProfileRelation.destroy({
                                where: {
                                    profileId: id
                                }
                            })
                        }

                        /**
                         * Espera la validacion de todos los inserts de perfiles
                         */

                        await Promise.all(permissions.map(async (permissionId, index) => {

                            try {
                                const respTemp = await permProfileRelation.create({
                                    profileId: id,
                                    permissionId: permissionId
                                });
                                permissionSuccess++;
                                return respTemp;
                            } catch (err) {
                                permissionError++;
                                return false;
                            }

                        }));
                    } catch (err) {
                        console.log(err);
                    }

                    try {
                        if (wpsessions) {
                            /**
                             * Elimina todos los sistemas para agregar los nuevos
                             */
                            await wpProfileRelation.destroy({
                                where: {
                                    profileId: id
                                }
                            })
                        }

                        /**
                         * Espera la validacion de todos los inserts de sistemas
                         */

                        await Promise.all(wpsessions.map(async (wpsessionId, index) => {

                            try {
                                const respTemp = await wpProfileRelation.create({
                                    profileId: id,
                                    wpsessionId: wpsessionId
                                });
                                systemSuccess++;
                                return respTemp;
                            } catch (err) {
                                systemError++;
                                return false;
                            }

                        }));
                    } catch (err) {
                        console.log(err);
                    }

                    try {
                        if (twilioPhones) {
                            /**
                             * Elimina todos los telefonos de twilio para agregar los nuevos
                             */
                            await twilioProfileRelation.destroy({
                                where: {
                                    profileId: id
                                }
                            })
                        }

                        /**
                         * Espera la validacion de todos los inserts de twilioPhones
                         */

                        await Promise.all(twilioPhones.map(async (tPhone, index) => {

                            try {
                                const respTemp = await twilioProfileRelation.create({
                                    profileId: id,
                                    twilioPhoneId: tPhone
                                });
                                twilioPhonesSuccess++;
                                return respTemp;
                            } catch (err) {
                                twilioPhonesError++;
                                return false;
                            }

                        }));
                    } catch (err) {
                        console.log(err);
                    }
                    //Registra el movimiento el la tabla userlogs
                    historyObj.user = id;
                    historyObj.changeType = 'ProfileUpdateSuccess';
                    historyObj.description = `Perfil actualizado ${id} permissions: succes ${permissionSuccess}, error ${permissionError} systemNames: succes ${systemSuccess}, error ${systemError} twilioPhones: success ${twilioPhonesSuccess} error: ${twilioPhonesError}]`;
                    history.regHistory(historyObj);

                    arrMsg.push(`Permisos: succes ${permissionSuccess}, error ${permissionError}`);
                    arrMsg.push(`Sistemas: succes ${systemSuccess}, error ${systemError}`);
                    return res.status(200).send({ status: 'Success', msg: arrMsg, profile: profileObj });
                } else {
                    arrMsg.push(`No existe el perfil ${id}`);
                    return res.status(200).send({ status: 'error', msg: arrMsg });
                }

            } catch (err) {
                //Registra el movimiento el la tabla userlogs
                historyObj.user = id;
                historyObj.changeType = 'ProfileUpdateError';
                historyObj.description = `Err:  ${err.message}`;

                arrMsg.push(`Ocurrio un error al actualizar el perfil`);
                arrMsg.push(err.message);
                console.log(err);
                return res.status(200).send({ status: 'error', msg: arrMsg });
            }

        } else {
            try {
                const profileCreated = await profile.create(profileObj);

                //Registra el movimiento el la tabla userlogs
                historyObj.user = profileCreated.id;
                historyObj.changeType = 'ProfileCreateSuccess';
                history.regHistory(historyObj);

                /**
                 * Variables para contar cuantos permisos se agregaron
                 */
                let permissionSuccess = 0, permissionError = 0;

                /**
                 * Variables para contar cuantos sistemas se agregaron
                 */
                let systemSuccess = 0, systemError = 0;

                /**
                * Variables para contar cuantos sistemas se agregaron
                */
                let twilioPhonesSuccess = 0, twilioPhonesError = 0;

                try {


                    /**
                     * Espera la validacion de todos los inserts de perfiles
                     */

                    await Promise.all(permissions.map(async (permissionId, index) => {

                        try {
                            const respTemp = await permProfileRelation.create({
                                profileId: profileCreated.id,
                                permissionId: permissionId
                            });
                            permissionSuccess++;
                            return respTemp;
                        } catch (err) {
                            permissionError++;
                            return false;
                        }

                    }));
                } catch (err) {
                    console.log(err);
                    arrMsg.push(`Ocurrio un error al asignar permisos ${err.message}`);
                }

                try {

                    /**
                     * Espera la validacion de todos los inserts de sistemas
                     */

                    await Promise.all(wpsessions.map(async (wpsessionId, index) => {

                        try {
                            const respTemp = await wpProfileRelation.create({
                                profileId: profileCreated.id,
                                wpsessionId: wpsessionId
                            });
                            systemSuccess++;
                            return respTemp;
                        } catch (err) {
                            console.log(err);
                            systemError++;
                            return false;
                        }

                    }));
                } catch (err) {
                    console.log(err);
                    arrMsg.push(`Ocurrio un error al asignar sistemas ${err.message}`);
                }

                try {
                    if (twilioPhones) {
                        /**
                         * Elimina todos los telefonos de twilio para agregar los nuevos
                         */
                        await twilioProfileRelation.destroy({
                            where: {
                                profileId: profileCreated.id
                            }
                        })
                    }

                    /**
                     * Espera la validacion de todos los inserts de twilioPhones
                     */

                    await Promise.all(twilioPhones.map(async (tPhone, index) => {

                        try {
                            const respTemp = await twilioProfileRelation.create({
                                profileId: profileCreated.id,
                                twilioPhoneId: tPhone
                            });
                            twilioPhonesSuccess++;
                            return respTemp;
                        } catch (err) {
                            twilioPhonesError++;
                            return false;
                        }

                    }));
                } catch (err) {
                    console.log(err);
                }
                historyObj.description = `Perfil creado ${id} permissions: succes ${permissionSuccess}, error ${permissionError} systemNames: succes ${systemSuccess}, error ${systemError} twilioPhones: success ${twilioPhonesSuccess} error: ${twilioPhonesError}]`;
                arrMsg.push(`Permisos: succes ${permissionSuccess}, error ${permissionError}`);
                arrMsg.push(`Sistemas: succes ${systemSuccess}, error ${systemError}`);

                return res.status(200).send({ status: 'Success', msg: arrMsg, profile: profileCreated });
            } catch (err) {
                //Registra el movimiento el la tabla userlogs
                historyObj.user = id;
                historyObj.changeType = 'ProfileCreateError';
                historyObj.description = `Err:  ${err.message}`;
                history.regHistory(historyObj);
                arrMsg.push(`Ocurrio un error al crear el perfil`);
                arrMsg.push(err.message);

                return res.status(200).send({ status: 'error', msg: arrMsg });
            }
        }
    },
    /**
     * Fucnion para eliminar el perfil por id
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async deleteProfile(req, res) {
        /**
        * Variables para guardar los mensaje y el historial
        */
        let arrMsg = [];
        let historyObj = {};

        /**
         * Revisamos si contiene un id
         */
        const { id } = req.body;

        if (id) {
            try {
                /**
                 * Actualiza los usuarios con ese perfil
                 * Los cambia a perfil por default (1) para que no sean eliminados
                 */
                await userModel.update(
                    { profile: 1 },
                    {
                        where: {
                            profile: id
                        }
                    }
                )
                const profileDel = await profile.destroy({
                    where: {
                        id: id
                    }
                })
                /**
                 * Si lo eliminó manda un mensaje de success
                 */
                if (profileDel) {
                    arrMsg.push(`Se eliminó correctamente el perfil ${id}`);

                    historyObj.user = id;
                    historyObj.changeType = 'ProfileDelSuccess';
                    historyObj.description = `Profile eliminado ${id}`;
                    history.regHistory(historyObj);

                    return res.status(200).send({ status: 'Success', msg: arrMsg });
                } else {
                    arrMsg.push(`No existe perfil para eliminar`);
                    return res.status(200).send({ status: 'error', msg: arrMsg });
                }
            } catch (err) {
                historyObj.user = id;
                historyObj.changeType = 'ProfileDelError';
                historyObj.description = `Err:  ${err.message}`;
                history.regHistory(historyObj);

                arrMsg.push(`Ocurrio un error al eliminar el perfil`);
                arrMsg.push(err.message);

                return res.status(200).send({ status: 'error', msg: arrMsg });
            }
        } else {
            arrMsg.push(`El id es requerido`);
            return res.status(200).send({ status: 'error', msg: arrMsg });
        }
    }
};