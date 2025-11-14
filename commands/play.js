// commands/play.js
const Command = require("../Command");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client);
    this.name = "play";
    this.inVoiceChannel = true;

    this.slashBuilder = new SlashCommandBuilder()
      .setName("play")
      .setDescription("Xuxi tocando com link ou string")
      .addStringOption(opt =>
        opt
          .setName("input")
          .setDescription("link ou nome")
          .setRequired(true)
      )
      .addBooleanOption(opt =>
        opt
          .setName("skip")
          .setDescription("Xuxa a musica")
          .setRequired(false)
      )
      .addIntegerOption(opt =>
        opt
          .setName("position")
          .setDescription("Posição da xuxi na queue")
          .setRequired(false)
      );
  }

  async onChatInput(interaction) {
    const input = interaction.options.getString("input");
    if (!input) {
      return interaction.reply({ content: "❌ Xuxi 37.", flags: 64 });
    }

    const skip = interaction.options.getBoolean("skip") ?? false;
    const position = interaction.options.getInteger("position") ?? undefined;
    const vc = interaction.member?.voice?.channel;

    if (!vc) {
      return interaction.reply({ content: "❌ Xuxi 45", flags: 64 });
    }

    await interaction.deferReply({ flags: 64 });

    try {
    await this.client.distube.play(vc, input, {
        skip,
        position,
        textChannel: interaction.channel,
        member: interaction.member,
        metadata: { interaction },
    });

    await interaction.editReply(`🔊 Xuxano: **${input}**`);
    } catch (err) {
    console.error(err);
    
    if (interaction.deferred || interaction.replied) {
        await interaction.editReply("❌ Xuxi 64.");
    } else {
        await interaction.reply({ content: "❌ Xuxi 66.", flags: 64 });
    }
    }
  }
};
