module.exports = class DisTubeErrorEvent {
  constructor(client) {
    this.client = client;
    this.name = "error";
  }

  run(error, queue) {
    console.error("Erro DisTube:", error);
    if (queue?.textChannel) {
      queue.textChannel.send('❌ Não consegui reproduzir essa música. Tente outro link ou termo.').catch(console.error);
    }
  }
};
