const { fillRadio } = require('../../radioService');

module.exports = class PlaySongEvent {
  constructor(client) {
    this.client = client;
    this.name = "playSong";
  }

  run(queue, song) {
    queue.textChannel?.send(`🎵 Tocando agora: **${song.name}**`).catch(console.error);
    if (this.client.radioStations.has(queue.id)) {
      fillRadio(this.client, queue.id).catch(error => {
        console.error('Falha ao reabastecer rádio Last.fm:', error.message);
        this.client.radioStations.delete(queue.id);
        queue.textChannel?.send('⚠️ A rádio parou de buscar músicas. A fila atual continuará tocando.').catch(console.error);
      });
    }
  }
};
