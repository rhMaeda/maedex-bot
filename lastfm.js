async function request(method, params) {
  const query = new URLSearchParams({ method, ...params, api_key: process.env.LASTFM_API_KEY, format: 'json' });
  const response = await fetch(`https://ws.audioscrobbler.com/2.0/?${query}`, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Last.fm respondeu HTTP ${response.status}.`);
  const data = await response.json();
  if (data.error) throw new Error(`Last.fm: ${data.message || `erro ${data.error}`}`);
  return data;
}

function asArray(value) {
  return value ? (Array.isArray(value) ? value : [value]) : [];
}

async function searchTrack(input) {
  const separator = input.indexOf(' - ');
  const params = separator < 0
    ? { track: input }
    : { artist: input.slice(0, separator), track: input.slice(separator + 3) };
  const data = await request('track.search', { ...params, limit: '1' });
  const track = asArray(data.results?.trackmatches?.track)[0];
  return track?.name && track?.artist
    ? { name: track.name, artist: track.artist }
    : null;
}

async function similarTracks(seed) {
  const data = await request('track.getSimilar', {
    artist: seed.artist,
    track: seed.name,
    autocorrect: '1',
    limit: '50',
  });
  return asArray(data.similartracks?.track)
    .map(track => ({ name: track.name, artist: track.artist?.name || track.artist }))
    .filter(track => typeof track.name === 'string' && typeof track.artist === 'string');
}

module.exports = { searchTrack, similarTracks };
