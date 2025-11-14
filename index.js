// index.js
require('dotenv').config();
const DisTubeClient = require('./DisTubeClient');
const { GatewayIntentBits } = require("discord.js"); 

const client = new DisTubeClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log("🔑 Tentando login no Discord..."))
  .catch(console.error);
