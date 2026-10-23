// Command.js
const sendResponse = require('./sendResponse');

class Command {
  constructor(client) {
    this.client = client;
    this.inVoiceChannel = false;
  }

  async onChatInput(interaction) {
    throw new Error("O comando não implementou onChatInput!");
  }

  respond(interaction, response) {
    return sendResponse(interaction, response);
  }
}

module.exports = Command;
