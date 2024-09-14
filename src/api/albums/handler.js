const logger = require('../../utils/logger'); // Ensure you have the correct logger module

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.addAlbum = this.addAlbum.bind(this);
    this.getAlbums = this.getAlbums.bind(this);
    this.getAlbumById = this.getAlbumById.bind(this);
    this.updateAlbumById = this.updateAlbumById.bind(this);
    this.deleteAlbumById = this.deleteAlbumById.bind(this);
  }

  async addAlbum(request, h) {
    logger.info('Received request to add album:', request.payload);

    // Validate the request payload using the validator
    const { error } = this._validator.validate(request.payload);
    if (error) {
      logger.error('Validation error:', error.details[0].message);
      return h.response({
        status: 'fail',
        message: error.details[0].message,
      }).code(400); // Return 400 Bad Request if validation fails
    }

    try {
      const { name, year } = request.payload;
      logger.info(`Attempting to add album with name: ${name}, year: ${year}`);
      const albumId = await this._service.addAlbum({ name, year });

      logger.info(`Album created with ID: ${albumId}`);
      return h.response({
        status: 'success',
        data: { albumId, name, year },
      }).code(201);
    } catch (err) {
      logger.error('Error adding album:', err);
      return h.response({
        status: 'error',
        message: 'Internal Server Error',
        details: err.message || 'Unknown error',
      }).code(500);
    }
  }

  async getAlbums(request, h) {
    logger.info('Received request to get albums');
    try {
      const queryParams = request.query;
      logger.info('Fetching albums with query params:', queryParams);
      const albums = await this._service.getAlbums(queryParams);
      logger.info(`Fetched ${albums.length} albums`);
      return h.response({
        status: 'success',
        data: { albums },
      }).code(200);
    } catch (err) {
      logger.error('Error fetching albums:', err);
      return h.response({
        status: 'error',
        message: 'Internal Server Error',
        details: err.message || 'Unknown error',
      }).code(500);
    }
  }

  async getAlbumById(request, h) {
    const { id } = request.params;
    logger.info(`Received request to get album by ID: ${id}`);
    try {
      logger.info(`Fetching album with ID: ${id}`);
      const album = await this._service.getAlbumById(id);
      logger.info(`Fetched album with ID: ${id}`);
      return h.response({
        status: 'success',
        data: { album },
      }).code(200);
    } catch (err) {
      logger.error(`Error fetching album with ID: ${id}`, err);
      return h.response({
        status: 'fail',
        message: err.message || 'Album not found',
      }).code(404);
    }
  }

  async updateAlbumById(request, h) {
    const { id } = request.params;
    logger.info(`Received request to update album by ID: ${id}`);
    
    const { error } = this._validator.validate(request.payload);
    if (error) {
      logger.error('Validation error:', error.details[0].message);
      return h.response({
        status: 'fail',
        message: error.details[0].message,
      }).code(400);
    }

    try {
      const albumsUp = await this._service.updateAlbumById(id, request.payload);
      if(!albumsUp) {
        logger.warn(`Album with ID: ${id} not found`);
        return h.response({
          status: 'fail',
          message: "Album not found",
        }).code(404);
      }
      logger.info(`Album with ID: ${id} updated`);
      return h.response({
        status: 'success',
        message: 'Album updated',
      }).code(200);
    } catch (err) {
      logger.error(`Error updating album with ID: ${id}`, err);
      return h.response({
        status: 'error',
        message: 'Internal Server Error',
        details: err.message || 'Unknown error',
      }).code(500);
    }
  }

  async deleteAlbumById(request, h) {
    const { id } = request.params;
    logger.info(`Received request to delete album by ID: ${id}`);
    try {
      const albumDel = await this._service.deleteAlbumById(id);
      if(!albumDel){
        logger.warn(`Album with ID: ${id} not found`);
        return h.response({
          status: 'fail',
          message: "Album notfound",
        }).code(404);
      }
      logger.info(`Album with ID: ${id} deleted`);
      return h.response({
        status: 'success',
        message: 'Album deleted',
      }).code(200);
    } catch (err) {
      logger.error(`Error deleting album with ID: ${id}`, err);
      return h.response({
        status: 'error',
        message: 'Internal Server Error',
        details: err.message || 'Unknown error',
      }).code(500);
    }
  }
}

module.exports = AlbumsHandler;
