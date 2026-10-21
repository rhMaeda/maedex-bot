const { MessageFlags } = require('discord.js');

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
      if (command.inVoiceChannel) {
        const queue = this.client.distube.getQueue(interaction.guildId);
        if (queue || command.name === 'play') {
          const channel = interaction.member?.voice?.channel;
          if (!channel) {
            return interaction.reply({ content: '❌ Entre em um canal de voz para usar este comando.', flags: MessageFlags.Ephemeral });
          }
          if (queue?.voiceChannel && queue.voiceChannel.id !== channel.id) {
            return interaction.reply({ content: '❌ Entre no mesmo canal de voz do bot para controlar a música.', flags: MessageFlags.Ephemeral });
          }
        }
      }
      await command.onChatInput(interaction);
    } catch (err) {
      console.error(err);
      if (interaction.deferred) {
        await interaction.editReply('❌ Não consegui executar o comando. Tente novamente.');
      } else if (interaction.replied) {
        await interaction.followUp({ content: '❌ Não consegui executar o comando. Tente novamente.', flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ content: '❌ Não consegui executar o comando. Tente novamente.', flags: MessageFlags.Ephemeral });
      }
    }
  }
};
