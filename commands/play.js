const Command = require("../Command");
const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { isURL } = require("distube");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const PreferredYouTubePlugin = require("../plugins/PreferredYouTubePlugin");

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client);
    this.name = "play";
    this.inVoiceChannel = true;

    this.slashBuilder = new SlashCommandBuilder()
      .setName("play")
      .setDescription("Toca uma música ou adiciona à fila")
      .addStringOption(opt =>
        opt
          .setName("input")
          .setDescription("Link ou nome da música")
          .setRequired(true)
      )
      .addBooleanOption(opt =>
        opt
          .setName("skip")
          .setDescription("Interrompe a atual e toca esta agora")
          .setRequired(false)
      )
      .addIntegerOption(opt =>
        opt
          .setName("position")
          .setDescription("Posição na fila (a partir de 1)")
          .setMinValue(1)
          .setRequired(false)
      );
  }

  async onChatInput(interaction) {
    const input = interaction.options.getString("input");
    if (!input) return interaction.reply({ content: "❌ Informe um link ou nome de música.", flags: MessageFlags.Ephemeral });

    const skip = interaction.options.getBoolean("skip") ?? false;
    const position = interaction.options.getInteger("position") ?? undefined;
    const vc = interaction.member?.voice?.channel;

    if (skip && position !== undefined) {
      return interaction.reply({ content: "❌ Use 'skip' ou 'position', não os dois juntos.", flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      // Preserva o erro de autenticação que o DisTube converte em NO_RESULT.
      let song = input;
      if (!isURL(input)) {
        const youtube = this.client.distube.plugins.find(plugin => plugin instanceof PreferredYouTubePlugin);
        const soundcloud = this.client.distube.plugins.find(plugin => plugin instanceof SoundCloudPlugin);
        song = await youtube.searchSong(input) || await soundcloud.searchSong(input);
        if (!song) throw new Error("Nenhuma música encontrada.");
      }
      await this.client.distube.play(vc, song, {
        skip,
        position,
        textChannel: interaction.channel,
        member: interaction.member,
      });

      await interaction.editReply("✅ Música iniciada ou adicionada à fila.");
    } catch (err) {
      console.error(err);
      await interaction.editReply(err.code === "YOUTUBE_AUTH_REQUIRED"
        ? "❌ O YouTube bloqueou o acesso desta VPS. Configure YOUTUBE_COOKIES_FILE no servidor."
        : "❌ Não consegui tocar essa música. Confira o link ou tente outro termo.");
    }
  }
};
