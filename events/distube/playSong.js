module.exports = class PlaySongEvent {
  constructor(client) {
    this.client = client;
    this.name = "playSong";
  }

  run(queue, song) {
    queue.textChannel?.send(`🎵 Tocando agora: **${song.name}**`).catch(console.error);
  }
};
