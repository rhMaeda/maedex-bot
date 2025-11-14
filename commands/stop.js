const Command = require("../Command");
const { SlashCommandBuilder } = require("discord.js");

module.exports = class StopCommand extends Command {
  constructor(client) {
    super(client);
    this.name = "stop";
    this.inVoiceChannel = true;
    this.slashBuilder = new SlashCommandBuilder()
      .setName("stop")
      .setDescription("Xuxi foi tomar banho");
  }

  async onChatInput(interaction) {
    const queue = this.client.distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply({ content: "❌Sem xuxi!", ephemeral: true });

    queue.stop();
    interaction.reply("⏹ Xuxi parada!");
  }
};
