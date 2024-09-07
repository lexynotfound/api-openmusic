const pool = require('../../services/db');
const { nanoid } = require('nanoid');
const albumSchema = require('../../validators/albumsValid');

const addAlbum = async (request, h) => {
    console.log('AddAlbum Handler: Incoming request', request.payload);
    const { error, value } = albumSchema.validate(request.payload);
    if (error) {
        console.log('Validation Error:', error.details[0].message);
        return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    try {
        const id = `album-${nanoid()}`;
        const { name, year } = value;
        console.log('AddAlbum Handler: Validated data', { id, name, year });

        await pool.query(
            'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3)',
            [id, name, year]
        );

        return h.response({ status: 'success', data: { albumId: id } }).code(201);
    } catch (err) {
        console.error('Error creating album:', err);
        return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
};

const getAlbums = async (request, h) => {
    const { name, year } = request.query;

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

    try {
        const result = await pool.query(query, params);
        return h.response({ status: 'success', data: { albums: result.rows } }).code(200);
    } catch (err) {
        console.error(err);
        return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
};

const getAlbumById = async (request, h) => {
    const { id } = request.params;

    try {
        const albumResult = await pool.query('SELECT * FROM albums WHERE id = $1', [id]);
        if (albumResult.rows.length === 0) {
            return h.response({ status: 'fail', message: 'Album not found' }).code(404);
        }

        const songsResult = await pool.query('SELECT id, title, performer FROM songs WHERE album_id = $1', [id]);
        const album = { ...albumResult.rows[0], songs: songsResult.rows };

        return h.response({ status: 'success', data: { album } }).code(200);
    } catch (err) {
        console.error(err);
        return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
};

const updateAlbumById = async (request, h) => {
    const { id } = request.params;
    const { error, value } = albumSchema.validate(request.payload);
    if (error) {
        return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    try {
        await pool.query(
            'UPDATE albums SET name = $1, year = $2 WHERE id = $3',
            [value.name, value.year, id]
        );

        return h.response({ status: 'success', message: 'Album updated' }).code(200);
    } catch (err) {
        console.error(err);
        return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
};

const deleteAlbumById = async (request, h) => {
    const { id } = request.params;
    try {
        await pool.query('DELETE FROM albums WHERE id = $1', [id]);
        return h.response({ status: 'success', message: 'Album deleted' }).code(200);
    } catch (err) {
        console.error(err);
        return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
};

module.exports = { addAlbum, getAlbums, getAlbumById, updateAlbumById, deleteAlbumById };
