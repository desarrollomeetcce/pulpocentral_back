const sesiones = require('../Controllers/TestController')

const testSessions = async (req,res) => {
  	const ss = sesiones.getSessions();
	console.log(ss);
 	res.send('Test correcto')
};

module.exports = (app) => {
 app.get('/test', testSessions);
}
