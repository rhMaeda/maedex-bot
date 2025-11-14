require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('play')
        .setDescription('Toca música de YouTube, Spotify, SoundCloud ou busca por termo')
        .addStringOption(option =>
            option.setName('input') // ⚠ mudou de "query" para "input"
                .setDescription('URL ou termo de pesquisa')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Pula a música atual'),
    new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Para a música e desconecta'),
    new SlashCommandBuilder()
        .setName('autoplay')
        .setDescription('Ativa ou desativa o autoplay'),
    new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Mostra a fila de músicas')
].map(cmd => cmd.toJSON());

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
    }
})();
