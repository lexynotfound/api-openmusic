// src/api/albums/handler.js
const AlbumsService = require('../../services/AlbumsServices'); // Correct path and file name
const albumSchema = require('../../validators/albumsValid');
const albumsService = new AlbumsService(); // Proper instantiation of AlbumsService

const addAlbum = async (request, h) => {
  const { error, value } = albumSchema.validate(request.payload);
  if (error) {
    return h.response({ status: 'fail', message: error.details[0].message }).code(400);
  }

  try {
    const albumId = await albumsService.addAlbum(value);
    return h.response({ status: 'success', data: { albumId } }).code(201);
  } catch (err) {
    console.error('Error creating album:', err);
    return h.response({ status: 'error', message: 'Internal Server Error', details: err.message }).code(500);
  }
};

const getAlbums = async (request, h) => {
  try {
    const albums = await albumsService.getAlbums(request.query);
    if (albums.length === 0) {
      return h.response({ status: 'fail', message: 'No albums found' }).code(404);
    }
    return h.response({ status: 'success', data: { albums } }).code(200);
  } catch (err) {
    console.error('Error fetching albums:', err);
    return h.response({ status: 'error', message: 'Internal Server Error', details: err.message }).code(500);
  }
};

const getAlbumById = async (request, h) => {
  try {
    const album = await albumsService.getAlbumById(request.params.id);
    return h.response({ status: 'success', data: { album } }).code(200);
  } catch (err) {
    console.error('Error fetching album:', err);
    return h.response({ status: 'fail', message: err.message }).code(404);
  }
};

const updateAlbumById = async (request, h) => {
  const { error, value } = albumSchema.validate(request.payload);
  if (error) {
    return h.response({ status: 'fail', message: error.details[0].message }).code(400);
  }

  try {
    await albumsService.updateAlbumById(request.params.id, value);
    return h.response({ status: 'success', message: 'Album updated' }).code(200);
  } catch (err) {
    console.error('Error updating album:', err);
    return h.response({ status: 'error', message: 'Internal Server Error', details: err.message }).code(500);
  }
};

const deleteAlbumById = async (request, h) => {
  try {
    await albumsService.deleteAlbumById(request.params.id);
    return h.response({ status: 'success', message: 'Album deleted' }).code(200);
  } catch (err) {
    console.error('Error deleting album:', err);
    return h.response({ status: 'error', message: 'Internal Server Error', details: err.message }).code(500);
  }
};

module.exports = { addAlbum, getAlbums, getAlbumById, updateAlbumById, deleteAlbumById };
