module.exports = class ReadyEvent {
  constructor(client) {
    this.client = client;
    this.name = "clientReady";
  }

  run() {
    console.log(`✅ Bot logado como ${this.client.user.tag}`);
  }
};
