module.exports = class GuildDeleteEvent {
  constructor(client) {
    this.client = client;
    this.name = "guildDelete";
  }

  run(guild) {
    console.log(`❌ Saiu do servidor: ${guild.name} (${guild.id})`);
  }
};
