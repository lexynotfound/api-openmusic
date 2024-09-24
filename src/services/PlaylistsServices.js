const db = require('./db');
const { nanoid } = require('nanoid');
const logger = require('../utils/logger');

class PlaylistsService {
  async addPlaylist({ name, userId }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists (id, name, users_id) VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, userId],
    };

    const result = await db.query(query);
    if (!result.rows[0].id) {
      throw new Error('Playlist could not be added');
    }

    return result.rows[0].id;
  }

  async getPlaylists(userId) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists JOIN users ON playlists.users_id = users.id WHERE playlists.users_id = $1',
      values: [userId],
    };

    const result = await db.query(query);
    return result.rows;
  }

  async addSongToPlaylist({ playlistId, songId }) {
    const id = `playlist-song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await db.query(query);
    if (!result.rows[0].id) {
      throw new Error('Song could not be added to the playlist');
    }

    return result.rows[0].id;
  }

  // Log playlist activity (add/delete song)
  async logActivity({ playlistId, userId, songId, action }) {
    const id = `activity-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_activities (id, playlist_id, user_id, song_id, action, time) VALUES ($1, $2, $3, $4, $5, NOW())',
      values: [id, playlistId, userId, songId, action],
    };
    try {
      await db.query(query);
      logger.info(`Activity logged: ${action} song ${songId} in playlist ${playlistId} by user ${userId}`);
    } catch (error) {
      logger.error(`Error logging activity for song ${songId} in playlist ${playlistId}: ${error.message}`);
      throw error;
    }
  }

  // Get playlist activities
  async getActivities(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_activities.action, playlist_activities.time
             FROM playlist_activities
             JOIN users ON playlist_activities.user_id = users.id
             JOIN songs ON playlist_activities.song_id = songs.id
             WHERE playlist_activities.playlist_id = $1
             ORDER BY playlist_activities.time ASC`,
      values: [playlistId],
    };
    try {
      const result = await db.query(query);
      if (result.rows.length === 0) {
        logger.warn(`No activities found for playlist ${playlistId}`);
        throw new Error('No activities found for this playlist');
      }
      logger.info(`Retrieved activities for playlist ${playlistId}`);
      return result.rows;
    } catch (error) {
      logger.error(`Error retrieving activities for playlist ${playlistId}: ${error.message}`);
      throw error;
    }
  }

  async getPlaylistSongs(playlistId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username, songs.id AS song_id, songs.title, songs.performer 
             FROM playlist_songs 
             JOIN playlists ON playlist_songs.playlist_id = playlists.id 
             JOIN songs ON playlist_songs.song_id = songs.id 
             JOIN users ON playlists.users_id = users.id 
             WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const result = await db.query(query);

    if (result.rows.length === 0) {
      throw new Error('Playlist not found');
    }

    const playlist = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      username: result.rows[0].username,
      songs: result.rows.map((row) => ({
        id: row.song_id,
        title: row.title,
        performer: row.performer,
      })),
    };

    return playlist;
  }

  // New method to delete a playlist
  async deletePlaylist(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await db.query(query);
    if (result.rowCount === 0) {
      throw new Error('Playlist not found');
    }
  }

  // New method to delete a song from a playlist
  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };

    const result = await db.query(query);
    if (result.rowCount === 0) {
      throw new Error('Song not found in the playlist');
    }
  }

  async verifyPlaylistOwner(playlistId, userId) {
  const query = {
    text: 'SELECT * FROM playlists WHERE id = $1 AND users_id = $2',
    values: [playlistId, userId],
  };

  const result = await db.query(query);
  if (result.rows.length === 0) {
    logger.warn(`User ${userId} is not the owner of playlist ${playlistId}`);
    throw new Error('You do not have access to this playlist');
  }
  logger.info(`User ${userId} verified as owner of playlist ${playlistId}`);
}

}

module.exports = PlaylistsService;
