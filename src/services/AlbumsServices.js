// src/services/AlbumsService.js
const { Pool } = require('pg');
const { nanoid } = require('nanoid');

class AlbumsService {
  constructor() {
    // Use environment variables for configuration consistency
    this._pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'openmusic',
      password: process.env.DB_PASSWORD || 'r',
      port: process.env.DB_PORT || 5432,
    });
  }

  async addAlbum({ name, year }) {
    const id = `albums-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new Error('Album could not be added');
    }

    return result.rows[0].id;
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

    const result = await this._pool.query(query, params);
    return result.rows;
  }

  async getAlbumById(id) {
    const albumResult = await this._pool.query('SELECT * FROM albums WHERE id = $1', [id]);
    if (albumResult.rows.length === 0) {
      throw new Error('Album not found');
    }

    const songsResult = await this._pool.query('SELECT * FROM songs WHERE "albumId" = $1', [id]);
    const album = albumResult.rows[0];
    album.songs = songsResult.rows;

    return album;
  }

  async updateAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new Error('Album not found');
    }

    return result.rows[0].id;
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new Error('Album not found');
    }

    return result.rowCount;
  }
}

module.exports = AlbumsService;
