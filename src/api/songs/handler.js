// api/songs/handler.js
const { nanoid } = require('nanoid');
const { connect } = require('http2');
const db = require('../../services/db');
const songSchema = require('../../validators/songsValid');

const addSong = async (request, h) => {
  const { error, value } = songSchema.validate(request.payload);
  if (error) {
    return h.response({ status: 'fail', message: error.details[0].message }).code(400);
  }

  const { title, performer, genre, duration, year, albumId } = value;
  const id = `songs-${nanoid()}`;

  try {
    const result = await db.query(
      'INSERT INTO songs (id, title, performer, genre, duration, year, "albumId") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [id, title, performer, genre, duration, year, albumId]
    );

    return h.response({ status: 'success', data: { songId: result.rows[0].id } }).code(201);
  } catch (err) {
    console.error('Error creating song:', err);
    return h.response({ status: 'error', message: 'Internal Server Error', details: err.message }).code(500);
  }
};


const getSongs = async (request, h) => {
  const { title, performer } = request.query;

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

  try {
    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return h.response({ status: 'fail', message: 'No songs found' }).code(404);
    }

    return h.response({ status: 'success', data: { songs: result.rows } }).code(200);
  } catch (err) {
    console.error('Error fetching songs:', err);
    return h.response({ status: 'error', message: 'Internal Server Error', details: err.message }).code(500);
  }
};


const getSongById = async (request, h) => {
  const { id } = request.params;

  try {
    const result = await db.query('SELECT * FROM songs WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return h.response({ status: 'fail', message: 'Song not found' }).code(404);
    }

    return h.response({ status: 'success', data: { song: result.rows[0] } }).code(200);
  } catch (err) {
    console.error('Error fetching song:', err);
    return h.response({ status: 'error', message: 'Internal Server Error', details: err.message }).code(500);
  }
};


const updateSongById = async (request, h) => {
  const { id } = request.params;
  const { error, value } = songSchema.validate(request.payload);
  if (error) {
    return h.response({ status: 'fail', message: error.details[0].message }).code(400);
  }

  const { title, performer, genre, duration, year, albumId } = value;

  try {
    await db.query(
      'UPDATE songs SET title = $1, performer = $2, genre = $3, duration = $4, year = $5, "albumId" = $6 WHERE id = $7',
      [title, performer, genre, duration, year, albumId, id]
    );

    return h.response({ status: 'success', message: 'Song updated' }).code(200);
  } catch (err) {
    console.error('Error updating song:', err);
    return h.response({ status: 'error', message: 'Internal Server Error', details: err.message }).code(500);
  }
};


const deleteSongById = async (request, h) => {
  const { id } = request.params;

  try {
    await db.query('DELETE FROM songs WHERE id = $1', [id]);
    return h.response({ status: 'success', message: 'Song deleted' }).code(200);
  } catch (err) {
    console.error('Error deleting song:', err);
    return h.response({ status: 'error', message: 'Internal Server Error', details: err.message }).code(500);
  }
};


module.exports = { addSong, getSongs, getSongById, updateSongById, deleteSongById };
