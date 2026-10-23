const test = require("node:test");
const assert = require("node:assert/strict");
const { Playlist } = require("distube");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const PlayCommand = require("../commands/play");
const PreferredYouTubePlugin = require("../plugins/PreferredYouTubePlugin");

test("busca a versão do YouTube e obtém o áudio dela", async t => {
  const plugin = new PreferredYouTubePlugin();
  const calls = t.mock.method(plugin, "getInfo", async input => {
    if (input.startsWith("ytsearch1:")) {
      return { entries: [{ id: "original", title: "Seven Nation Army (Official)", duration: 240 }] };
    }
    return { url: "https://audio.example/track" };
  });
  const song = await plugin.searchSong("seven nation army");

  assert.equal(song.name, "Seven Nation Army (Official)");
  assert.equal(song.url, "https://www.youtube.com/watch?v=original");
  assert.equal(await plugin.getStreamURL(song), "https://audio.example/track");
  assert.equal(calls.mock.callCount(), 2);
});

test("busca do YouTube indisponível permite tentar SoundCloud", async t => {
  const plugin = new PreferredYouTubePlugin();
  t.mock.method(plugin, "getInfo", async () => { throw new Error("indisponível"); });
  t.mock.method(console, "error", () => {});

  assert.equal(await plugin.searchSong("seven nation army"), null);
});

test("playlist do YouTube usa yt-dlp e mantém as músicas", async t => {
  const plugin = new PreferredYouTubePlugin();
  t.mock.method(plugin, "getInfo", async () => ({
    id: "lista",
    title: "Minha playlist",
    entries: [
      { id: "primeira", title: "Primeira" },
      null,
      { id: "segunda", title: "Segunda" }
    ]
  }));

  const playlist = await plugin.resolve("https://www.youtube.com/playlist?list=lista");
  assert.ok(playlist instanceof Playlist);
  assert.deepEqual(playlist.songs.map(song => song.name), ["Primeira", "Segunda"]);
  assert.equal(playlist.songs[0].url, "https://www.youtube.com/watch?v=primeira");
});

test("bloqueio do YouTube não toca remix do SoundCloud", async t => {
  const youtube = new PreferredYouTubePlugin();
  const soundcloud = new SoundCloudPlugin();
  const authError = new Error("YouTube exige autenticação");
  authError.code = "YOUTUBE_AUTH_REQUIRED";
  t.mock.method(youtube, "getInfo", async () => { throw authError; });
  const fallback = t.mock.method(soundcloud, "searchSong", async () => ({ name: "Remix" }));
  t.mock.method(console, "error", () => {});

  let reply;
  const command = new PlayCommand({ distube: {
    plugins: [youtube, soundcloud],
    play: async () => { throw new Error("Não deveria tocar"); }
  } });
  const interaction = {
    options: {
      getString: () => "seven nation army",
      getBoolean: () => null,
      getInteger: () => null
    },
    member: { voice: { channel: {} } },
    deferReply: async () => { interaction.deferred = true; },
    editReply: async message => { reply = message; }
  };
  await command.onChatInput(interaction);

  assert.equal(fallback.mock.callCount(), 0);
  assert.match(reply, /YouTube bloqueou/);
});
