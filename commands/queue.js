const Command = require("../Command");
const { SlashCommandBuilder } = require("discord.js");

module.exports = class QueueCommand extends Command {
  constructor(client) {
    super(client);
    this.name = "queue";
    this.inVoiceChannel = true;
    this.slashBuilder = new SlashCommandBuilder()
      .setName("queue")
      .setDescription("Xuxi na queue");
  }

  async onChatInput(interaction) {
    const queue = this.client.distube.getQueue(interaction.guildId);
    if (!queue || !queue.songs.length) {
      return interaction.reply({ content: "❌ Xuxi 17 - queue.js", ephemeral: true });
    }

    const list = queue.songs
      .map((song, index) => `${index === 0 ? "🎶 **Xuxando agora**" : `\`${index}\``} — ${song.name} (${song.formattedDuration})`)
      .join("\n");

    interaction.reply({ content: `📜 **Fila de xuxo:**\n\n${list}`, ephemeral: false });
  }
};
