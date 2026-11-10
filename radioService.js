const { similarTracks } = require('./lastfm');
const musicSearch = require('./musicSearch');

const trackKey = track => `${track.artist.toLowerCase()}\0${track.name.toLowerCase()}`;

async function fillRadio(client, guildId) {
  const station = client.radioStations.get(guildId);
  const queue = client.distube.getQueue(guildId);
  if (!station || !queue || station.filling || queue.songs.length >= 4) return;

  station.filling = true;
  try {
    let attempts = 0;
    let refreshes = 0;
    while (queue.songs.length < 4 && attempts < 12) {
      if (!station.candidates.length) {
        if (refreshes++ >= 1) break;
        station.candidates = await similarTracks(station.seed);
        if (!station.candidates.length) break;
      }

      const candidate = station.candidates.shift();
      attempts++;
      const key = trackKey(candidate);
      if (station.seen.has(key)) continue;
      station.seen.add(key);

      let song;
      try {
        song = await musicSearch(client, `${candidate.artist} - ${candidate.name}`);
      } catch (error) {
        if (error.code === 'YOUTUBE_AUTH_REQUIRED') throw error;
        console.error('Falha ao localizar sugestão da rádio:', error.message);
        continue;
      }
      if (!song || station.songIds.has(song.id)) continue;
      if (client.radioStations.get(guildId) !== station || queue.stopped) return;
      queue.addToQueue(song);
      station.songIds.add(song.id);
      station.seed = candidate;
    }
  } finally {
    station.filling = false;
  }
}

module.exports = { fillRadio, trackKey };
