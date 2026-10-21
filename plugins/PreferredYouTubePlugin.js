const { Playlist, Song } = require("distube");
const { YouTubePlugin } = require("@distube/youtube");
const ytDlp = require("@distube/yt-dlp");

module.exports = class PreferredYouTubePlugin extends YouTubePlugin {
  getInfo(input, options) {
    return ytDlp.json(input, {
      ...options,
      cookies: process.env.YOUTUBE_COOKIES_FILE || undefined
    }).catch(err => {
      if (/Sign in to confirm.*not a bot/i.test(err.message)) {
        const error = new Error("YouTube exige autenticação nesta VPS. Configure YOUTUBE_COOKIES_FILE.");
        error.code = "YOUTUBE_AUTH_REQUIRED";
        throw error;
      }
      throw err;
    });
  }

  toSong(video, options) {
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
  }

  async resolve(url, options) {
    const info = await this.getInfo(url, {
      dumpSingleJson: true,
      noWarnings: true,
      skipDownload: true,
      flatPlaylist: true
    });
    if (!Array.isArray(info.entries)) return this.toSong(info, options);

    const songs = info.entries.filter(video => video?.id).map(video => this.toSong(video, options));
    if (!songs.length) throw new Error("A playlist do YouTube não tem vídeos acessíveis.");
    return new Playlist({
      source: "youtube",
      id: info.id,
      name: info.title,
      url: info.webpage_url || url,
      songs
    }, options);
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
      return this.toSong(video, options);
    } catch (err) {
      if (err.code === "YOUTUBE_AUTH_REQUIRED") throw err;
      console.error("Falha ao buscar no YouTube:", err.message.split("\n")[0]);
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
