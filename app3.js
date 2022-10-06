const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

require('dotenv').config()

const sesiones = require('./Controllers/TestController')

const bodyParser = require('body-parser');


/**
 * Lee el body y lo convierte en JSON para su uso
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


let count = 1;
sesiones.addSession({name:'Test',id:count});
count++;

/**
 * Rutas para los servicios
 */
require('./routes/index')(app);

app.listen(8000)