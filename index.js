require('dotenv').config();
const DisTubeClient = require('./DisTubeClient');
const { GatewayIntentBits } = require("discord.js"); 

if (!process.env.DISCORD_TOKEN) throw new Error('Configure DISCORD_TOKEN no arquivo .env');

const client = new DisTubeClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
  allowedMentions: { parse: [] },
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
