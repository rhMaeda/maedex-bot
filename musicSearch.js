const { SoundCloudPlugin } = require('@distube/soundcloud');
const PreferredYouTubePlugin = require('./plugins/PreferredYouTubePlugin');

module.exports = async function musicSearch(client, query) {
  const youtube = client.distube.plugins.find(plugin => plugin instanceof PreferredYouTubePlugin);
  const soundcloud = client.distube.plugins.find(plugin => plugin instanceof SoundCloudPlugin);
  return await youtube.searchSong(query) || await soundcloud.searchSong(query);
};
