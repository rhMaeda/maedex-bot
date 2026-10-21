module.exports = class AddSongEvent {
  constructor(client) {
    this.client = client;
    this.name = "addSong";
  }

  run(queue, song) {
    queue.textChannel?.send(`➕ Adicionado à fila: **${song.name}**`).catch(console.error);
  }
};
