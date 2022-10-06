
/**
 * --------------------Controllers------------------------------
 */

const wpsessionController = require('./WpSessionController');
var socketClientsObj = {
    data: []
};
var socket = null;



function setSocket(sock){
    socket = sock;
}


module.exports = {sockets: {}};