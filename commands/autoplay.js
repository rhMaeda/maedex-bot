const Command = require("../Command");
const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = class AutoplayCommand extends Command {
  constructor(client) {
    super(client);
    this.name = "autoplay";
    this.inVoiceChannel = true;
    this.slashBuilder = new SlashCommandBuilder()
      .setName("autoplay")
      .setDescription("Ativa ou desativa o autoplay");
  }

  async onChatInput(interaction) {
    const queue = this.client.distube.getQueue(interaction.guildId);
    if (!queue) return this.respond(interaction, { content: "📭 Não há música tocando.", flags: MessageFlags.Ephemeral });
    if (this.client.radioStations.has(interaction.guildId)) {
      return this.respond(interaction, '📻 A rádio já escolhe as próximas músicas. Use /stop para encerrá-la.');
    }

    const status = queue.toggleAutoplay();
    return this.respond(interaction, `🔁 Autoplay **${status ? "ativado" : "desativado"}**`);
  }
};
