const { Song } = require("distube");
const { YouTubePlugin } = require("@distube/youtube");
const ytDlp = require("@distube/yt-dlp");

module.exports = class PreferredYouTubePlugin extends YouTubePlugin {
  getInfo(input, options) {
    return ytDlp.json(input, options);
  }

  async searchSong(query, options) {
    try {
      const result = await this.getInfo(`ytsearch1:${query}`, {
        dumpSingleJson: true,
        noWarnings: true,
        skipDownload: true
      });
      const video = result.entries?.[0];
      if (!video?.id) return null;
      return new Song({
        plugin: this,
        source: "youtube",
        playFromSource: true,
        id: video.id,
        name: video.title,
        url: video.webpage_url || `https://www.youtube.com/watch?v=${video.id}`,
        thumbnail: video.thumbnail,
        duration: video.duration,
        uploader: { name: video.uploader }
      }, options);
    } catch (err) {
      console.error("Falha ao buscar no YouTube:", err);
      return null;
    }
  }

  async getStreamURL(song) {
    const info = await this.getInfo(song.url, {
      dumpSingleJson: true,
      noWarnings: true,
      skipDownload: true,
      format: "ba/ba*"
    });
    if (!info.url) throw new Error("YouTube não retornou uma URL de áudio.");
    return info.url;
  }
};
