module.exports = class PlayListEvent {
  constructor(client) {
    this.client = client;
    this.name = "playList";
  }

  run(queue, playlist) {
    queue.textChannel?.send(`🎵 Tocando playlist: **${playlist.name}**`);
  }
};
