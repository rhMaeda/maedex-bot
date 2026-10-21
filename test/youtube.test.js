const test = require("node:test");
const assert = require("node:assert/strict");
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
