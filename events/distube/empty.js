module.exports = class EmptyEvent {
  constructor(client) {
    this.client = client;
    this.name = "empty";
  }

  run(queue) {
    queue.textChannel?.send("⚠️ Canal de voz vazio. Saindo...");
  }
};
