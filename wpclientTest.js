const { io } = require("socket.io-client");

const socket = io('http://localhost:8000');


socket.on("connect", () => {
    console.log("Socket cliente conectado"); // x8WIv7-mJelg7on_ALbx
    socket.emit('initSessions',['client2']);
    
});


socket.on("NEW_MESSAGE", (msg) => {
    console.log(msg); // x8WIv7-mJelg7on_ALbx
});
