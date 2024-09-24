const db = require('./db');
const { nanoid } = require('nanoid');
const logger = require('../utils/logger');

class PlaylistActivitiesService {
  async addActivity({ playlistId, userId, songId, action }) {
    const id = `activity-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_activities (id, playlist_id, user_id, song_id, action, time) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id',
      values: [id, playlistId, userId, songId, action],
    };
    await db.query(query);
  }

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
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = PlaylistActivitiesService;
