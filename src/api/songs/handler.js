// src/api/songs/handler.js
const SongsService = require('../../services/SongsService');
const songSchema = require('../../validators/songsValid');
const logger = require('../../utils/logger');
const songsService = new SongsService();

const addSong = async (request, h) => {
  logger.info('Received request to add song:', request.payload);
  const { error, value } = songSchema.validate(request.payload);
  if (error) {
    logger.error('Validation error:', error.details[0].message);
    return h.response({ status: 'fail', message: error.details[0].message }).code(400);
  }

  try {
    const songId = await songsService.addSong(value);
    logger.info(`Song created with ID: ${songId}`);
    return h.response({ status: 'success', data: { songId } }).code(201);
  } catch (err) {
    logger.error('Error creating song:', err);
    return h.response({ status: 'error', message: 'Internal Server Error', details: err.message }).code(500);
  }
};

const getSongs = async (request, h) => {
  logger.info('Received request to get songs');
  try {
    const songs = await songsService.getSongs(request.query);
    if (songs.length === 0) {
      logger.info('No songs found');
      return h.response({ status: 'fail', message: 'No songs found' }).code(404);
    } 
    const filteredSongs = songs.map(({ id, title, performer }) => ({ id, title, performer })); // Only show required fields
    logger.info(`Fetched ${filteredSongs.length} songs`);
    return h.response({ status: 'success', data: { songs: filteredSongs } }).code(200);
  } catch (err) {
    logger.error('Error fetching songs:', err);
    return h.response({ status: 'error', message: 'Internal Server Error', details: err.message }).code(500);
  }
};

const getSongById = async (request, h) => {
  logger.info(`Received request to get song by ID: ${request.params.id}`);
  try {
    const song = await songsService.getSongById(request.params.id);
    logger.info('Song found:', song);
    return h.response({ status: 'success', data: { song } }).code(200);
  } catch (err) {
    logger.error('Error fetchingsong:', err);
    if(err.message.includes('not found')){
      return h.response({
        status: 'fail',
        message: "Songs Notfound",
      }).code(404);
    }
    logger.error('Error fetching song:', err);
    return h.response({ status: 'error', message: 'Internal Server Error', details: err.message }).code(500);
    
  }
};

const updateSongById = async (request, h) => {
  logger.info(`Received request to update song by ID: ${request.params.id}`);

  try {
     // Check if the song exists
    const existingSongs = await songsService.getSongById(request.params.id);
    logger.info('Value of existingAlbum:', existingSongs);
    if (!existingSongs) {
      logger.warn(`Album with ID: ${id} not found`);
        return h.response({
          status: 'fail',
          message: 'Songs notfound',
      }).code(404); // Return 404 Not Found if the album does not exist
    }
    
    const { error, value } = songSchema.validate(request.payload);
    if (error) {
      logger.error('Validation error:', error.details[0].message);
      return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    await songsService.updateSongById(request.params.id, value);
    logger.info(`Song with ID: ${request.params.id} updated`);
    return h.response({ status: 'success', message: 'Song updated' }).code(200);
  } catch (err) {
    logger.error('Error deleting song:', err);
    if(err.message.includes('not found')){
      return h.response({
        status: 'fail',
        message: "Songs Notfound",
      }).code(404);
    }
    logger.error('Error updating song:', err);
    return h.response({ status: 'error', message: 'Internal Server Error', details: err.message }).code(500);
  }
};

const deleteSongById = async (request, h) => {
  logger.info(`Received request to delete song by ID: ${request.params.id}`);
  try {
    await songsService.deleteSongById(request.params.id);
    logger.info(`Song with ID: ${request.params.id} deleted`);
    return h.response({ status: 'success', message: 'Song deleted' }).code(200);
  } catch (err) {
    logger.error('Error deleting song:', err);
    if(err.message.includes('not found')){
      return h.response({
        status: 'fail',
        message: "Songs Notfound",
      }).code(404);
    }
    logger.error('Error deleting song:', err);
    return h.response({ status: 'error', message: 'Internal Server Error', details: err.message }).code(500);
  }
};

module.exports = { addSong, getSongs, getSongById, updateSongById, deleteSongById };
