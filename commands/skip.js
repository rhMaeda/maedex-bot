const Command = require("../Command");
const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = class SkipCommand extends Command {
  constructor(client) {
    super(client);
    this.name = "skip";
    this.inVoiceChannel = true;
    this.slashBuilder = new SlashCommandBuilder()
      .setName("skip")
      .setDescription("Pula a xuxi atual");
  }

  async onChatInput(interaction) {
    const queue = this.client.distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply({ content: "❌ Sem xuxo skip!", ephemeral: true });

    queue.skip();
    interaction.reply("⏭ Xuxi pulada!");
  }
};
