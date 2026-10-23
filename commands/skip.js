const Command = require("../Command");
const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = class SkipCommand extends Command {
  constructor(client) {
    super(client);
    this.name = "skip";
    this.inVoiceChannel = true;
    this.slashBuilder = new SlashCommandBuilder()
      .setName("skip")
      .setDescription("Pula para a próxima música ou para um número da fila")
      .addIntegerOption(option => option
        .setName("position")
        .setDescription("Número mostrado em /queue (1 = próxima música)")
        .setMinValue(1));
  }

  async onChatInput(interaction) {
    const queue = this.client.distube.getQueue(interaction.guildId);
    if (!queue) return this.respond(interaction, { content: "📭 Não há música tocando.", flags: MessageFlags.Ephemeral });
    const position = interaction.options.getInteger("position");
    const upcoming = Math.max(0, queue.songs.length - 1);
    if (position != null && (position < 1 || position > upcoming)) {
      return this.respond(interaction, { content: `❌ A música ${position} não existe na fila. Há ${upcoming} próxima(s) música(s).`, flags: MessageFlags.Ephemeral });
    }
    if (position == null && queue.songs.length <= 1 && !queue.autoplay) {
      return this.respond(interaction, { content: "❌ Não há próxima música na fila.", flags: MessageFlags.Ephemeral });
    }

    if (position != null) {
      await queue.jump(position);
      return this.respond(interaction, `⏭ Indo para a música ${position} da fila!`);
    }
    await queue.skip();
    return this.respond(interaction, "⏭ Música pulada!");
  }
};
