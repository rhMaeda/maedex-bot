const Command = require('../Command');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { searchTrack, similarTracks } = require('../lastfm');
const musicSearch = require('../musicSearch');
const { fillRadio, trackKey } = require('../radioService');

module.exports = class RadioCommand extends Command {
  constructor(client) {
    super(client);
    this.name = 'radio';
    this.inVoiceChannel = true;
    this.slashBuilder = new SlashCommandBuilder()
      .setName('radio')
      .setDescription('Inicia uma rádio baseada em uma música')
      .addStringOption(option => option
        .setName('musica')
        .setDescription('Nome da música, de preferência Artista - Música')
        .setMinLength(2)
        .setMaxLength(150)
        .setRequired(true));
  }

  async onChatInput(interaction) {
    if (!process.env.LASTFM_API_KEY) {
      return this.respond(interaction, { content: '❌ Configure LASTFM_API_KEY na VPS para usar a rádio.', flags: MessageFlags.Ephemeral });
    }
    if (this.client.distube.getQueue(interaction.guildId)) {
      return this.respond(interaction, { content: '❌ Já existe uma fila tocando. Use /stop antes de iniciar outra rádio.', flags: MessageFlags.Ephemeral });
    }

    if (!interaction.deferred) await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const seed = await searchTrack(interaction.options.getString('musica'));
      if (!seed) return this.respond(interaction, '❌ Não encontrei essa música no Last.fm. Tente Artista - Música.');
      const candidates = await similarTracks(seed);
      if (!candidates.length) return this.respond(interaction, '❌ O Last.fm não encontrou músicas semelhantes para iniciar a rádio.');
      const song = await musicSearch(this.client, `${seed.artist} - ${seed.name}`);
      if (!song) return this.respond(interaction, '❌ Não encontrei áudio para a música inicial.');

      await this.client.distube.play(interaction.member.voice.channel, song, {
        textChannel: interaction.musicOutputChannel || interaction.channel,
        member: interaction.member,
      });
      const queue = this.client.distube.getQueue(interaction.guildId);
      this.client.radioStations.set(interaction.guildId, {
        seed,
        candidates,
        seen: new Set([trackKey(seed)]),
        songIds: new Set([song.id]),
        filling: false,
      });

      try {
        await fillRadio(this.client, interaction.guildId);
      } catch (error) {
        console.error('Falha ao preparar rádio Last.fm:', error.message);
      }
      if (queue.songs.length < 2) {
        this.client.radioStations.delete(interaction.guildId);
        return this.respond(interaction, '⚠️ A música inicial está tocando, mas não encontrei outras faixas reproduzíveis para a rádio.');
      }
      return this.respond(interaction, `📻 Rádio iniciada com **${seed.artist} — ${seed.name}**. Recomendações: [Last.fm](https://www.last.fm/).`);
    } catch (error) {
      console.error('Falha na rádio Last.fm:', error.message);
      return this.respond(interaction, error.code === 'YOUTUBE_AUTH_REQUIRED'
        ? '❌ O YouTube bloqueou o acesso da VPS. A rádio não pôde iniciar.'
        : '❌ Não consegui iniciar a rádio. Confira a chave do Last.fm e tente outra música.');
    }
  }
};
