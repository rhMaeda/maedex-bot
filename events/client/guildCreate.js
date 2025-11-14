module.exports = class GuildCreateEvent {
  constructor(client) {
    this.client = client;
    this.name = "guildCreate";
  }

  run(guild) {
    console.log(`✅ Entrou no servidor: ${guild.name} (${guild.id})`);
  }
};
