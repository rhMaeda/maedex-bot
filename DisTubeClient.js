// DisTubeClient.js
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { YouTubePlugin } = require("@distube/youtube");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const ffmpeg = require("ffmpeg-static");

class DisTubeClient extends Client {
  constructor(options) {
    super(options);

    // Coleção de comandos
    this.commands = new Collection();

    // Inicializa DisTube
    this.distube = new DisTube(this, {
      emitNewSongOnly: true,
      emitAddSongWhenCreatingQueue: false,
      emitAddListWhenCreatingQueue: false,
      plugins: [
        new SpotifyPlugin(),
        new SoundCloudPlugin(),
        new YouTubePlugin(),
        new YtDlpPlugin()
      ],
      ffmpeg: ffmpeg
    });

    // Carrega comandos
    readdirSync(join(__dirname, "commands")).forEach(this.loadCommand.bind(this));

    // Carrega eventos do client
    readdirSync(join(__dirname, "events/client")).forEach(this.loadClientEvent.bind(this));

    // Carrega eventos do DisTube
    readdirSync(join(__dirname, "events/distube")).forEach(this.loadDisTubeEvent.bind(this));
  }

  async loadCommand(file) {
    try {
      const CommandClass = require(`./commands/${file}`);
      const cmd = new CommandClass(this);
      this.commands.set(cmd.name, cmd);
      console.log(`✅ Comando carregado: ${cmd.name}`);
    } catch (err) {
      console.error(`❌ Falha ao carregar comando ${file}:`, err);
    }
  }

  async loadClientEvent(file) {
    try {
      const EventClass = require(`./events/client/${file}`);
      const event = new EventClass(this);
      this.on(event.name, (...args) => event.run(...args));
      console.log(`✅ Evento client carregado: ${event.name}`);
    } catch (err) {
      console.error(`❌ Falha ao carregar evento client ${file}:`, err);
    }
  }

  async loadDisTubeEvent(file) {
    try {
      const EventClass = require(`./events/distube/${file}`);
      const event = new EventClass(this);
      this.distube.on(event.name, (...args) => event.run(...args));
      console.log(`✅ Evento DisTube carregado: ${event.name}`);
    } catch (err) {
      console.error(`❌ Falha ao carregar evento DisTube ${file}:`, err);
    }
  }
}

module.exports = DisTubeClient;
