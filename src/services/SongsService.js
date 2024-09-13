// src/services/SongsService.js
const { Pool } = require('pg');
const { nanoid } = require('nanoid');

class SongsService {
  constructor() {
    // Configure database connection using environment variables
    this._pool = new Pool({
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || 'localhost',
      database: process.env.PGDATABASE || 'openmusic',
      password: process.env.PGPASSWORD || 'r',
      port: process.env.PGPORT || 5432,
    });
  }

  async addSong({ title, performer, genre, duration, year, albumId }) {
    const id = `songs-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO songs (id, title, performer, genre, duration, year, "albumId") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, performer, genre, duration, year, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new Error('Song could not be added');
    }

    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    let query = 'SELECT * FROM songs WHERE 1=1';
    const params = [];

    if (title) {
      params.push(`%${title}%`);
      query += ` AND title ILIKE $${params.length}`;
    }

    if (performer) {
      params.push(`%${performer}%`);
      query += ` AND performer ILIKE $${params.length}`;
    }

    const result = await this._pool.query(query, params);
    return result.rows;
  }

  async getSongById(id) {
    const result = await this._pool.query('SELECT * FROM songs WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new Error('Song not found');
    }

    return result.rows[0];
  }

  async updateSongById(id, { title, performer, genre, duration, year, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, performer = $2, genre = $3, duration = $4, year = $5, "albumId" = $6 WHERE id = $7 RETURNING id',
      values: [title, performer, genre, duration, year, albumId, id],
    };

    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new Error('Song not found');
    }

    return result.rows[0].id;
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new Error('Song not found');
    }

    return result.rowCount;
  }
}

module.exports = SongsService;
