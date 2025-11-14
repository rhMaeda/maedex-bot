module.exports = class FinishEvent {
  constructor(client) {
    this.client = client;
    this.name = "finish";
  }

  run(queue) {
    queue.textChannel?.send("⏹ Fila finalizada!");
  }
};
