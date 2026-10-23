const Command = require("../Command");
const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = class StopCommand extends Command {
  constructor(client) {
    super(client);
    this.name = "stop";
    this.inVoiceChannel = true;
    this.slashBuilder = new SlashCommandBuilder()
      .setName("stop")
      .setDescription("Para a música e desconecta o bot");
  }

  async onChatInput(interaction) {
    const queue = this.client.distube.getQueue(interaction.guildId);
    if (!queue) return this.respond(interaction, { content: "📭 Não há música tocando.", flags: MessageFlags.Ephemeral });

    await queue.stop();
    this.client.distube.voices.leave(interaction.guildId);
    return this.respond(interaction, "⏹ Música parada. Até a próxima!");
  }
};
