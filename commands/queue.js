const Command = require("../Command");
const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = class QueueCommand extends Command {
  constructor(client) {
    super(client);
    this.name = "queue";
    this.slashBuilder = new SlashCommandBuilder()
      .setName("queue")
      .setDescription("Mostra as próximas músicas");
  }

  async onChatInput(interaction) {
    const queue = this.client.distube.getQueue(interaction.guildId);
    if (!queue || !queue.songs.length) {
      return this.respond(interaction, { content: "📭 A fila está vazia.", flags: MessageFlags.Ephemeral });
    }

    const list = queue.songs
      .slice(0, 10)
      .map((song, index) => `${index === 0 ? "🎶 **Tocando agora**" : `\`${index}\``} — ${song.name.slice(0, 100)} (${song.formattedDuration})`)
      .join("\n");

    const remaining = queue.songs.length - 10;
    return this.respond(interaction, `📜 **Fila de músicas:**\n\n${list}${remaining > 0 ? `\n… e mais ${remaining} música(s).` : ''}`);
  }
};
