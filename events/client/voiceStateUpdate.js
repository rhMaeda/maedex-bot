module.exports = class VoiceStateUpdateEvent {
  constructor(client) {
    this.client = client;
    this.name = 'voiceStateUpdate';
  }

  async run(oldState, newState) {
    if (!oldState.channelId || oldState.channelId === newState.channelId || oldState.member?.user.bot) return;

    const queue = this.client.distube.getQueue(oldState.guild.id);
    if (!queue || queue.voiceChannel?.id !== oldState.channelId) return;
    if (oldState.channel?.members.some(member => !member.user.bot && member.id !== oldState.id)) return;

    try {
      await queue.stop();
      queue.voice.leave();
      await queue.textChannel?.send('⚠️ Canal de voz vazio. Saindo...');
    } catch (err) {
      console.error(err);
    }
  }
};
