const db = require('./db');
const { nanoid } = require('nanoid');

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
}

module.exports = PlaylistsService;
