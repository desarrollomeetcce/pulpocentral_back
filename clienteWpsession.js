const qrcode = require('qrcode-terminal');

const { Client,LocalAuth   } = require('whatsapp-web.js');


const wpsession = require('./models').WpSession;
const chatModel = require('./models').Chat;
let sessionData;
// Use the saved values

function convertToLocalChat(chat){

    const newChat = {
        ...chat,
        whatsappId: chat.id._serialized,
        phone: chat.id.user,
        status: 'Nuevo',
        id: 0
    }

    return newChat;
}


async function sendMessage(id){

    const chat = await client.getChatById(id);

   // await chat.sendMessage("Esto es una prueba 2");
    await chat.sendSeen();
}

async function updateOrCreateChat(chat){

    console.log(chat.id._serialized);
    const chatTemp = await chatModel.findAll({
        where:{
            whatsappId: chat.id._serialized
        }
    })

    if(chatTemp.length > 0){

        let updatedChat =  convertToLocalChat(chat);

        delete updatedChat.id;
        await chatModel.update(
            updatedChat,
            {where:{
                whatsappId: chat.id._serialized
            }}
        );
    }else{
        await chatModel.create(convertToLocalChat(chat));
    }
}
const client = new Client({
    authStrategy: new LocalAuth({ clientId: "client2" })
});

// Save session values to the file upon successful auth
client.on('authenticated', async (session) => {
    sessionData = session;
    

    await wpsession.create({
        sessionAuth: JSON.stringify(session),
        name: "cliente2",
        welcomeMessage: "Bienvenido !",
    });
});


client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', async () => {
    console.log('Client is ready!');
    const chats = await client.getChats();


    chats.map(async (chat,key)=>{
      //  console.log(chat);
        const messages = await chat.fetchMessages({limit: 100});
       // console.log(messages)
        messages.map(async (message,key)=>{
            if(message.hasQuotedMsg){
              //  console.log("Mensaje quota");
                const quoted = await message.getQuotedMessage();
               // console.log(quoted)
               // console.log("Mensaje quota fin");
            }
          //  console.log(message.links);
        })
       
        updateOrCreateChat(chat);
    });

    sendMessage("5215547649443@c.us");
    
});

client.on('message', message => {
	console.log(message.body);
});

client.on('message', message => {
	if(message.body === '!ping') {
		message.reply('pong');
	}
});

process.on("SIGINT", async () => {
    console.log("(SIGINT) Shutting down...");
    await client.destroy();
    process.exit(0);
})

client.initialize();

