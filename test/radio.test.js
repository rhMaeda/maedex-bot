const test = require('node:test');
const assert = require('node:assert/strict');
const { searchTrack, similarTracks } = require('../lastfm');
const { fillRadio, trackKey } = require('../radioService');
const RadioCommand = require('../commands/radio');

test('rádio informa quando a chave Last.fm não está configurada', async t => {
  const oldKey = process.env.LASTFM_API_KEY;
  delete process.env.LASTFM_API_KEY;
  t.after(() => {
    if (oldKey !== undefined) process.env.LASTFM_API_KEY = oldKey;
  });
  let reply;
  const command = new RadioCommand({ distube: { getQueue: () => undefined } });
  await command.onChatInput({ reply: async message => { reply = message; } });
  assert.match(reply.content, /LASTFM_API_KEY/);
});

test('Last.fm encontra a música inicial e suas sugestões', async t => {
  const oldKey = process.env.LASTFM_API_KEY;
  process.env.LASTFM_API_KEY = 'test-key';
  t.after(() => {
    if (oldKey === undefined) delete process.env.LASTFM_API_KEY;
    else process.env.LASTFM_API_KEY = oldKey;
  });
  const methods = [];
  t.mock.method(globalThis, 'fetch', async url => {
    const params = new URL(url).searchParams;
    methods.push(params.get('method'));
    assert.equal(params.get('api_key'), 'test-key');
    return { ok: true, json: async () => params.get('method') === 'track.search'
      ? { results: { trackmatches: { track: { name: 'Seven Nation Army', artist: 'The White Stripes' } } } }
      : { similartracks: { track: [{ name: 'Song 2', artist: { name: 'Blur' } }] } } };
  });
  const seed = await searchTrack('The White Stripes - Seven Nation Army');
  assert.deepEqual(seed, { name: 'Seven Nation Army', artist: 'The White Stripes' });
  assert.deepEqual(await similarTracks(seed), [{ name: 'Song 2', artist: 'Blur' }]);
  assert.deepEqual(methods, ['track.search', 'track.getSimilar']);
});

test('rádio reabastece a fila sem repetir faixas e limpa o estado ao terminar', async t => {
  const { SoundCloudPlugin } = require('@distube/soundcloud');
  const PreferredYouTubePlugin = require('../plugins/PreferredYouTubePlugin');
  const DeleteQueueEvent = require('../events/distube/deleteQueue');
  const youtube = Object.create(PreferredYouTubePlugin.prototype);
  const soundcloud = Object.create(SoundCloudPlugin.prototype);
  const searches = [];
  youtube.searchSong = async query => { searches.push(query); return { id: query }; };
  soundcloud.searchSong = async () => null;
  const queue = {
    id: 'guild',
    songs: [{ id: 'initial' }],
    addToQueue(song) { this.songs.push(song); },
  };
  const station = {
    seed: { artist: 'Artist', name: 'Initial' },
    candidates: [
      { artist: 'Artist', name: 'Initial' },
      { artist: 'Blur', name: 'Song 2' },
      { artist: 'Muse', name: 'Song 3' },
      { artist: 'Queen', name: 'Song 4' },
    ],
    seen: new Set([trackKey({ artist: 'Artist', name: 'Initial' })]),
    songIds: new Set(['initial']),
    filling: false,
  };
  const client = {
    radioStations: new Map([['guild', station]]),
    distube: { getQueue: () => queue, plugins: [youtube, soundcloud] },
  };
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({ similartracks: { track: [] } }) }));
  await fillRadio(client, 'guild');
  assert.equal(queue.songs.length, 4);
  assert.deepEqual(searches, ['Blur - Song 2', 'Muse - Song 3', 'Queen - Song 4']);
  queue.songs.shift();
  await fillRadio(client, 'guild');
  assert.equal(queue.songs.length, 3);
  new DeleteQueueEvent(client).run(queue);
  assert.equal(client.radioStations.size, 0);
});
