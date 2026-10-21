module.exports = class FinishEvent {
  constructor(client) {
    this.client = client;
    this.name = "finish";
  }

  run(queue) {
    queue.textChannel?.send("⏹ Fila finalizada!").catch(console.error);
    // DisTube emite finish antes de remover a fila.
    queueMicrotask(() => queue.voice.leave());
  }
};
