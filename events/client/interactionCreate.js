module.exports = class InteractionCreateEvent {
  constructor(client) {
    this.client = client;
    this.name = "interactionCreate";
  }

  async run(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = this.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.onChatInput(interaction);
    } catch (err) {
      console.error(err);
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content: "❌ Ocorreu um erro ao executar o comando.", ephemeral: true });
      } else {
        await interaction.reply({ content: "❌ Ocorreu um erro ao executar o comando.", ephemeral: true });
      }
    }
  }
};
