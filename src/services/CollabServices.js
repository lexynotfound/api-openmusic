const db = require('./db');
const { nanoid } = require('nanoid');
const logger = require('../utils/logger'); // Assuming logger is set up

class CollaborationsService {
  // Add a new collaboration
  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO collaborations (id, playlist_id, user_id) VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    try {
      const result = await db.query(query);
      logger.info(`Collaboration added for playlist ${playlistId} with user ${userId}`);
      return result.rows[0].id;
    } catch (error) {
      logger.error(`Error adding collaboration: ${error.message}`);
      throw error;
    }
  }

  // Remove a collaboration
  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    try {
      const result = await db.query(query);
      if (result.rowCount === 0) {
        logger.warn(`Collaboration not found for playlist ${playlistId} with user ${userId}`);
        throw new Error('Collaboration not found');
      }
      logger.info(`Collaboration deleted for playlist ${playlistId} with user ${userId}`);
    } catch (error) {
      logger.error(`Error deleting collaboration: ${error.message}`);
      throw error;
    }
  }

  // Check if a user is a collaborator for a playlist
  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await db.query(query);
    if (result.rows.length === 0) {
      logger.warn(`User ${userId} is not a collaborator for playlist ${playlistId}`);
      throw new Error('User is not a collaborator');
    }
    logger.info(`User ${userId} verified as collaborator for playlist ${playlistId}`);
  }
}

module.exports = CollaborationsService;
