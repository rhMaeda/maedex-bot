const Command = require("../Command");
const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = class ShuffleCommand extends Command {
  constructor(client) {
    super(client);
    this.name = "shuffle";
    this.inVoiceChannel = true;
    this.slashBuilder = new SlashCommandBuilder()
      .setName("shuffle")
      .setDescription("Embaralha as próximas músicas da fila");
  }

  async onChatInput(interaction) {
    const queue = this.client.distube.getQueue(interaction.guildId);
    if (!queue || queue.songs.length < 3) {
      return this.respond(interaction, { content: "❌ São necessárias pelo menos duas próximas músicas para embaralhar.", flags: MessageFlags.Ephemeral });
    }

    await queue.shuffle();
    return this.respond(interaction, "🔀 Próximas músicas embaralhadas!");
  }
};
