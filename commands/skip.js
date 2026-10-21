const Command = require("../Command");
const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = class SkipCommand extends Command {
  constructor(client) {
    super(client);
    this.name = "skip";
    this.inVoiceChannel = true;
    this.slashBuilder = new SlashCommandBuilder()
      .setName("skip")
      .setDescription("Pula a música atual");
  }

  async onChatInput(interaction) {
    const queue = this.client.distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply({ content: "📭 Não há música tocando.", flags: MessageFlags.Ephemeral });
    if (queue.songs.length <= 1 && !queue.autoplay) {
      return interaction.reply({ content: "❌ Não há próxima música na fila.", flags: MessageFlags.Ephemeral });
    }

    await queue.skip();
    return interaction.reply("⏭ Música pulada!");
  }
};
