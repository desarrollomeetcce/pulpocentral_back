
const usuario = require('../models').User;
const profileModel = require('../models').Profile;
const permission = require('../models').Permission;
const wpsession = require('../models').WpSession;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const history = require('./HistoricoController');

module.exports = {
    /**
      * Login para generar JWT
      * @param {*} req 
      * @param {*} res 
      * @returns 
      */
    async checkPermissions(req, res) {
        let arrMsg = [];
        let historyObj = {};
        /**
        * Recibe el email y el password enviado
        */

        const { user } =req.userToken;

        try {


           
            /**
             * Busca el usuario en la base de datos
             * si existe trae los permisos y lo sistemas a los que tiene acceso
             */
            const userSelect = await usuario.findOne({
                where: {
                    email: user,
                },
                include: [
                    {
                        model: profileModel,
                        include: [
                            {
                                model: permission,
                            },
                            {
                                model: wpsession,
                            }
                        ]
                    }
                ],
            });


            /**
             * Si el usuario existe en bd compara la contraseña
             * Si los datos coinciden genera un JWT para devolver
             */
            if (userSelect) {

                /**
                 * Genera la lista de permisos del usuario
                 */
                let arrPerm = [];
                for (let index in userSelect.Profile.Permissions) {

                    arrPerm.push(userSelect.Profile.Permissions[index].name);

                }
                /**
                 * Genera la lista de sistemas a los que tiene acceso
                 */
                let arrSyst = [];
                let arrSystNum = [];
                for (let index in userSelect.Profile.WpSessions) {

                    arrSyst.push(userSelect.Profile.WpSessions[index].name);
                    arrSystNum.push(userSelect.Profile.WpSessions[index].id);
                }
                let userInfo = {
                    permissions: arrPerm,
                    wpsessions: arrSyst,
                    wpsessionsNum: arrSystNum,
                    id: userSelect.id
                }


  

                historyObj.user = user;
                historyObj.changeType = 'LoginSuccess';
                historyObj.description = arrMsg.join('-');

                history.regHistory(historyObj);
                return res.status(200).json({ status: "Success", userInfo: userInfo });
            }

            /**
             * Regresa un error en caso de que la contraseña no coincida o el usuario noexista
             */
            historyObj.user = user;
            historyObj.changeType = 'LoginFail';
            historyObj.description = arrMsg.join('-');

            history.regHistory(historyObj);
            arrMsg.push("Los datos son incorrectos");
            return res.status(200).json({ status: "Error", msg: arrMsg });

        } catch (err) {


            arrMsg.push("Ocurrió un error inesperado");
            arrMsg.push(err.message);

            historyObj.user = user;
            historyObj.changeType = 'LoginFail';
            historyObj.description = arrMsg.join('-');
            history.regHistory(historyObj);

            return res.status(200).json({ status: "Error", msg: arrMsg });

        }
    },
    /**
     * Login para generar JWT
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async login(req, res) {
        let arrMsg = [];
        let historyObj = {};
        /**
            * Recibe el email y el password enviado
            */
        const { email, password } = req.body;

        try {


            /**
             * Valida las credenciales
             */
            if (!(email || password)) {
                if (!email) {
                    arrMsg.push("El email es requerido");
                }
                if (!password) {
                    arrMsg.push("La contraseña es requerida");
                }

                historyObj.user = email;
                historyObj.changeType = 'LoginFail';
                historyObj.description = arrMsg.join('-');

                history.regHistory(historyObj);
                return res.status(200).json({ status: "Error", msg: arrMsg });

            }

            /**
             * Busca el usuario en la base de datos
             * si existe trae los permisos y lo sistemas a los que tiene acceso
             */
            const user = await usuario.findOne({
                where: {
                    email: email,
                },
            });


            /**
             * Si el usuario existe en bd compara la contraseña
             * Si los datos coinciden genera un JWT para devolver
             */
            if (user && (await bcrypt.compare(password, user.password))) {

                /**
                 * Genera JWT con duracion de 2 horas
                 */
                const token = jwt.sign(
                    { user: email },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: "2h",
                    }
                );

                historyObj.user = email;
                historyObj.changeType = 'LoginSuccess';
                historyObj.description = arrMsg.join('-');

                history.regHistory(historyObj);
                return res.status(200).json({ status: "Success", token: token });
            }

            /**
             * Regresa un error en caso de que la contraseña no coincida o el usuario noexista
             */
            historyObj.user = email;
            historyObj.changeType = 'LoginFail';
            historyObj.description = arrMsg.join('-');

            history.regHistory(historyObj);
            arrMsg.push("Los datos son incorrectos");
            return res.status(200).json({ status: "Error", msg: arrMsg });

        } catch (err) {


            arrMsg.push("Ocurrió un error inesperado");
            arrMsg.push(err.message);

            historyObj.user = email;
            historyObj.changeType = 'LoginFail';
            historyObj.description = arrMsg.join('-');
            history.regHistory(historyObj);

            return res.status(200).json({ status: "Error", msg: arrMsg });

        }
    },
    /**
     * Prueba para JWT
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async validaToken(req, res) {
        let arrMsg = [];
        /**
         * Si el token no es valido lo intercepta el middleware
         */
        arrMsg.push("El token es correcto");
        return res.status(200).json({ status: "Succes", msg: arrMsg });
    }
};
