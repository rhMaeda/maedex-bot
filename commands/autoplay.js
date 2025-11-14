const Command = require("../Command");
const { SlashCommandBuilder } = require("discord.js");

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
    if (!queue) return interaction.reply({ content: "❌ Sem xuxi toncando!", ephemeral: true });

    const status = queue.toggleAutoplay();
    interaction.reply(`🔁 Autoplay **${status ? "ativado" : "desativado"}**`);
  }
};
