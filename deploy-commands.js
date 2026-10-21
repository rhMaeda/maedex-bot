require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { readdirSync } = require('node:fs');
const { join } = require('node:path');

for (const key of ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID']) {
    if (!process.env[key]) throw new Error(`Configure ${key} no arquivo .env`);
}

const commands = readdirSync(join(__dirname, 'commands'))
    .filter(file => file.endsWith('.js'))
    .map(file => new (require(join(__dirname, 'commands', file)))().slashBuilder.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('📦 Atualizando comandos no servidor...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('✅ Comandos registrados com sucesso!');
    } catch (err) {
        console.error(err);
        process.exitCode = 1;
    }
})();
