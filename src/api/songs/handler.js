const pool = require('../../services/db');
const { nanoid } = require('nanoid');
const songSchema = require('../../validators/songsValid');

const addSong = async (request, h) => {
    console.log('AddSong Handler: Incoming request', request.payload);
    const { error, value } = songSchema.validate(request.payload);
    if (error) {
        console.log('Validation Error:', error.details[0].message);
        return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    try {
        const id = `song-${nanoid()}`;
        const { title, year, performer, genre, duration, albumId } = value;
        console.log('AddSong Handler: Validated data', { id, title, year, performer, genre, duration, albumId });

        await pool.query(
            'INSERT INTO songs (id, title, year, performer, genre, duration, album_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [id, title, year, performer, genre, duration, albumId]
        );

        return h.response({ status: 'success', data: { songId: id } }).code(201);
    } catch (err) {
        console.error('Error creating song:', err);
        return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
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
        const result = await pool.query(query, params);
        return h.response({ status: 'success', data: { songs: result.rows } }).code(200);
    } catch (err) {
        console.error(err);
        return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
};

const getSongById = async (request, h) => {
    const { id } = request.params;

    try {
        const result = await pool.query('SELECT * FROM songs WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return h.response({ status: 'fail', message: 'Song not found' }).code(404);
        }

        return h.response({ status: 'success', data: { song: result.rows[0] } }).code(200);
    } catch (err) {
        console.error(err);
        return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
};

const updateSongById = async (request, h) => {
    const { id } = request.params;
    const { error, value } = songSchema.validate(request.payload);
    if (error) {
        return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    try {
        await pool.query(
            'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6 WHERE id = $7',
            [value.title, value.year, value.performer, value.genre, value.duration, value.albumId, id]
        );

        return h.response({ status: 'success', message: 'Song updated' }).code(200);
    } catch (err) {
        console.error(err);
        return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
};

const deleteSongById = async (request, h) => {
    const { id } = request.params;

    try {
        await pool.query('DELETE FROM songs WHERE id = $1', [id]);
        return h.response({ status: 'success', message: 'Song deleted' }).code(200);
    } catch (err) {
        console.error(err);
        return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
};

module.exports = { addSong, getSongs, getSongById, updateSongById, deleteSongById };
