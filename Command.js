// Command.js
class Command {
  constructor(client) {
    this.client = client;
    this.inVoiceChannel = false;
  }

  async onChatInput(interaction) {
    throw new Error("O comando não implementou onChatInput!");
  }
}

module.exports = Command;
