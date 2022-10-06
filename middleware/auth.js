const jwt = require("jsonwebtoken");

/**
 * Traemos las variables de entorno
 * Nos interesa la variable TOKEN_KEY
 */
const config = process.env;

/**
 * Verifica que las peticiones contengan un token
 * en el header x-access-token
 * o en alguna parte del body
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
const verifyToken = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["pulpocentral-access-token"];

 /**
  * Si no hay token devuelve un error
  */
  if (!token) {
    return res.status(403).send({error:"El token es requerido"});
  }
  /**
   * Revisa si el token es valido y no ha caducado
   */
  try {

    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.userToken = decoded;

  } catch (err) {
    /**
     * En caso contrario no permite el acceso
     */
    return res.status(401).send({error:"El token no es válido"});
  }
  return next();
};

module.exports = verifyToken;