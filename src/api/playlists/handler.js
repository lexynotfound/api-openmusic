const logger = require('../../utils/logger'); // Assume you have a logger module

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    // Bind the methods
    this.addPlaylist = this.addPlaylist.bind(this);
    this.getPlaylists = this.getPlaylists.bind(this);
    this.addSongToPlaylist = this.addSongToPlaylist.bind(this);
    this.getPlaylistSongs = this.getPlaylistSongs.bind(this);
    this.deletePlaylist = this.deletePlaylist.bind(this);
    this.deleteSongFromPlaylist = this.deleteSongFromPlaylist.bind(this);
  }

  async addPlaylist(request, h) {
    const { error, value } = this._validator.playlistSchema.validate(request.payload);
    if (error) {
      logger.error(`Validation Error: ${error.details[0].message}`);
      return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    try {
      const playlistId = await this._service.addPlaylist({ ...value, userId: request.auth?.credentials?.userId });
      return h.response({ status: 'success', data: { playlistId } }).code(201);
    } catch (err) {
      logger.error(`Error adding playlist: ${err.message}`);
      return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
  }

  async getPlaylists(request, h) {
    try {
      if (!request.auth.credentials || !request.auth.credentials.userId) {
        return h.response({ status: 'fail', message: 'Unauthorized' }).code(401);
      }
      const playlists = await this._service.getPlaylists(request.auth.credentials.userId);
      if (!playlists.length) {
        return h.response({ status: 'fail', message: 'No playlists found' }).code(404);
      }
      return h.response({ status: 'success', data: { playlists } }).code(200);
    } catch (err) {
      logger.error(`Error retrieving playlists: ${err.message}`);
      return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
  }

  async addSongToPlaylist(request, h) {
    const { error, value } = this._validator.songToPlaylistSchema.validate(request.payload);
    if (error) {
      logger.error(`Validation Error: ${error.details[0].message}`);
      return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    try {
      const { playlistId } = request.params;
      await this._service.addSongToPlaylist({ playlistId, songId: value.songId });
      return h.response({ status: 'success', message: 'Song added to playlist' }).code(201);
    } catch (err) {
      logger.error(`Error adding song to playlist: ${err.message}`);
      return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
  }

  async getPlaylistSongs(request, h) {
    try {
      const playlist = await this._service.getPlaylistSongs(request.params.playlistId);
      return h.response({ status: 'success', data: { playlist } }).code(200);
    } catch (err) {
      logger.error(`Error retrieving playlist songs: ${err.message}`);
      if (err.message === 'Playlist not found') {
        return h.response({ status: 'fail', message: 'Playlist not found' }).code(404);
      }
      return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
  }

  async deletePlaylist(request, h) {
    try {
      const { playlistId } = request.params;
      await this._service.deletePlaylist(playlistId);
      return h.response({ status: 'success', message: 'Playlist deleted' }).code(200);
    } catch (err) {
      logger.error(`Error deleting playlist: ${err.message}`);
      if (err.message === 'Playlist not found') {
        return h.response({ status: 'fail', message: 'Playlist not found' }).code(404);
      }
      return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
  }

  async deleteSongFromPlaylist(request, h) {
    const { error, value } = this._validator.songToPlaylistSchema.validate(request.payload);
    if (error) {
      logger.error(`Validation Error: ${error.details[0].message}`);
      return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    try {
      const { playlistId } = request.params;
      await this._service.deleteSongFromPlaylist(playlistId, value.songId);
      return h.response({ status: 'success', message: 'Song removed from playlist' }).code(200);
    } catch (err) {
      logger.error(`Error deleting song from playlist: ${err.message}`);
      if (err.message === 'Song not found in the playlist') {
        return h.response({ status: 'fail', message: 'Song not found in the playlist' }).code(404);
      }
      return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
  }
}

module.exports = PlaylistsHandler;
