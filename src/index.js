require("dotenv/config");

const { Client, GatewayIntentBits } = require('discord.js');
// обработчик
const eventHandler = require("./handlers/eventHandler");



const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent,
  ],
});



// инициируем обработчик
eventHandler(client);


// токен для авторизации
client.login(process.env.TOKEN)