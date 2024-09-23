// src/handlers/playlistsHandler.js
class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    // Bind the methods
    this.addPlaylist = this.addPlaylist.bind(this);
    this.getPlaylists = this.getPlaylists.bind(this);
    this.addSongToPlaylist = this.addSongToPlaylist.bind(this);
    this.getPlaylistSongs = this.getPlaylistSongs.bind(this);
  }

  async addPlaylist(request, h) {
    const { error, value } = this._validator.playlistSchema.validate(request.payload);
    if (error) {
      return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    try {
      const playlistId = await this._service.addPlaylist({ ...value, userId: request.auth.credentials.userId });
      return h.response({ status: 'success', data: { playlistId } }).code(201);
    } catch (err) {
      return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
  }

  async getPlaylists(request, h) {
    try {
      const playlists = await this._service.getPlaylists(request.auth.credentials.userId);
      return h.response({ status: 'success', data: { playlists } }).code(200);
    } catch (err) {
      return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
  }

  async addSongToPlaylist(request, h) {
    const { error, value } = this._validator.songToPlaylistSchema.validate(request.payload);
    if (error) {
      return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    try {
      const { playlistId } = request.params;
      await this._service.addSongToPlaylist({ playlistId, songId: value.songId });
      return h.response({ status: 'success', message: 'Song added to playlist' }).code(201);
    } catch (err) {
      return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
  }

  async getPlaylistSongs(request, h) {
    try {
      const playlist = await this._service.getPlaylistSongs(request.params.playlistId);
      return h.response({ status: 'success', data: { playlist } }).code(200);
    } catch (err) {
      return h.response({ status: 'fail', message: 'Playlist not found' }).code(404);
    }
  }
}

module.exports = PlaylistsHandler;
