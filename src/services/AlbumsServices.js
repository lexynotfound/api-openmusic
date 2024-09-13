const db = require('./db');
const { nanoid } = require('nanoid');
const logger = require('../utils/logger');

class AlbumsService {
  async addAlbum({ name, year }) {
    const id = `albums-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    try {
      logger.info('Executing insert query:', query);
      const result = await db.query(query.text, query.values);
      logger.info('Insert query result:', result);

      if (!result.rows[0].id) {
        throw new Error('Album could not be added');
      }

      return result.rows[0].id;
    } catch (err) {
      logger.error('Error executing insert query:', err);
      throw err;
    }
  }

  async getAlbums({ name, year }) {
    let query = 'SELECT * FROM albums WHERE 1=1';
    const params = [];

    if (name) {
      params.push(`%${name}%`);
      query += ` AND name ILIKE $${params.length}`;
    }

    if (year) {
      params.push(year);
      query += ` AND year = $${params.length}`;
    }

    logger.info('Executing select query for albums:', { query, params });
    try {
      const result = await db.query(query, params);
      logger.info('Select query result:', result.rows.length);
      return result.rows;
    } catch (err) {
      logger.error('Error executing select query for albums:', err);
      throw err;
    }
  }

  async getAlbumById(id) {
    logger.info(`Fetching album by ID: ${id}`);
    try {
      const albumResult = await db.query('SELECT * FROM albums WHERE id = $1', [id]);
      if (albumResult.rows.length === 0) {
        throw new Error('Album not found');
      }

      const songsResult = await db.query('SELECT * FROM songs WHERE "albumId" = $1', [id]);
      const album = albumResult.rows[0];
      album.songs = songsResult.rows;

      logger.info(`Album fetched with ID: ${id}`, album);
      return album;
    } catch (err) {
      logger.error(`Error fetching album by ID: ${id}`, err);
      throw err;
    }
  }

  async updateAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    logger.info('Executing update query:', query);
    try {
      const result = await db.query(query.text, query.values);
      if (result.rowCount === 0) {
        throw new Error('Album not found');
      }

      logger.info(`Album updated with ID: ${id}`);
      return result.rows[0].id;
    } catch (err) {
      logger.error(`Error updating album by ID: ${id}`, err);
      throw err;
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1',
      values: [id],
    };

    logger.info('Executing delete query:', query);
    try {
      const result = await db.query(query.text, query.values);
      if (result.rowCount === 0) {
        throw new Error('Album not found');
      }

      logger.info(`Album deleted with ID: ${id}`);
      return result.rowCount;
    } catch (err) {
      logger.error(`Error deleting album by ID: ${id}`, err);
      throw err;
    }
  }
}

module.exports = AlbumsService;
