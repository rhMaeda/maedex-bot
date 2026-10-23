const { MessageFlags, PermissionFlagsBits } = require('discord.js');
const sendResponse = require('../../sendResponse');

module.exports = class InteractionCreateEvent {
  constructor(client) {
    this.client = client;
    this.name = "interactionCreate";
  }

  async run(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = this.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      if (process.env.MUSIC_CHANNEL_ID) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const channel = await interaction.guild?.channels.fetch(process.env.MUSIC_CHANNEL_ID).catch(() => null);
        const sendPermission = channel?.isThread?.() ? PermissionFlagsBits.SendMessagesInThreads : PermissionFlagsBits.SendMessages;
        if (!channel?.isTextBased?.() || !channel.permissionsFor(this.client.user)?.has([PermissionFlagsBits.ViewChannel, sendPermission])) {
          return interaction.editReply('❌ MUSIC_CHANNEL_ID não aponta para um canal de texto acessível ao bot. Confira o ID e as permissões.');
        }
        interaction.musicOutputChannel = channel;
      }
      if (command.inVoiceChannel) {
        const queue = this.client.distube.getQueue(interaction.guildId);
        if (queue || command.name === 'play') {
          const channel = interaction.member?.voice?.channel;
          if (!channel) {
            return sendResponse(interaction, { content: '❌ Entre em um canal de voz para usar este comando.', flags: MessageFlags.Ephemeral });
          }
          if (queue?.voiceChannel && queue.voiceChannel.id !== channel.id) {
            return sendResponse(interaction, { content: '❌ Entre no mesmo canal de voz do bot para controlar a música.', flags: MessageFlags.Ephemeral });
          }
        }
      }
      await command.onChatInput(interaction);
    } catch (err) {
      console.error(err);
      await sendResponse(interaction, { content: '❌ Não consegui executar o comando. Tente novamente.', flags: MessageFlags.Ephemeral });
    }
  }
};
