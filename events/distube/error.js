module.exports = class DisTubeErrorEvent {
  constructor(client) {
    this.client = client;
    this.name = "error";
  }

  run(error, queue) {
    console.error("Erro DisTube:", error);
    if (queue?.textChannel) {
      const message = error.code === "YOUTUBE_AUTH_REQUIRED"
        ? "❌ O YouTube bloqueou o acesso do bot. O administrador precisa configurar o acesso na VPS."
        : "❌ Não consegui reproduzir essa música. Tente outro link ou termo.";
      queue.textChannel.send(message).catch(console.error);
    }
  }
};
