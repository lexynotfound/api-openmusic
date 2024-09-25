const logger = require('../../utils/logger');

class CollaborationsHandler {
  constructor(collaborationService, playlistService, validator) {
    this._collaborationService = collaborationService;
    this._playlistService = playlistService;
    this._validator = validator; // Validator containing collaborationSchema

    this.addCollaboration = this.addCollaboration.bind(this);
    this.deleteCollaboration = this.deleteCollaboration.bind(this);
  }

  // Add a new collaboration
  async addCollaboration(request, h) {
    // Validate the payload
    const { error, value } = this._validator.collaborationSchema.validate(request.payload);
    if (error) {
      logger.error(`Validation Error: ${error.details[0].message}`);
      return h.response({ status: 'fail', message: error.details[0].message }).code(400); // Bad Request
    }

    const { playlistId, userId } = value;
    try {
      // Verify if the user making the request is the playlist owner
      const ownerId = request.auth.credentials.userId;
      const isOwner = await this._playlistService.verifyPlaylistOwner(playlistId, ownerId);
      if (!isOwner) {
        logger.warn(`User ${ownerId} is not the owner of playlist ${playlistId}`);
        return h.response({ status: 'fail', message: 'You do not have access to this resource' }).code(403); // Forbidden
      }

      // Add the collaboration
      const collaborationId = await this._collaborationService.addCollaboration(playlistId, userId);

      return h.response({
        status: 'success',
        data: { collaborationId },
      }).code(201); // Created
    } catch (err) {
      if (err.message === 'Playlist not found') {
        logger.error(`Playlist not found: ${playlistId}`);
        return h.response({ status: 'fail', message: 'Playlist not found' }).code(404); // Not Found
      }

      logger.error(`Error adding collaboration: ${err.message}`);
      return h.response({ status: 'error', message: 'Internal Server Error' }).code(500); // Internal Server Error
    }
  }

  // Delete an existing collaboration
  async deleteCollaboration(request, h) {
    // Validate the payload
    const { error, value } = this._validator.collaborationSchema.validate(request.payload);
    if (error) {
      logger.error(`Validation Error: ${error.details[0].message}`);
      return h.response({ status: 'fail', message: error.details[0].message }).code(400); // Bad Request
    }

    const { playlistId, userId } = value;
    try {
      // Verify if the user making the request is the playlist owner
      const ownerId = request.auth.credentials.userId;
      const isOwner = await this._playlistService.verifyPlaylistOwner(playlistId, ownerId);
      if (!isOwner) {
        logger.warn(`User ${ownerId} is not the owner of playlist ${playlistId}`);
        return h.response({ status: 'fail', message: 'You do not have access to this resource' }).code(403); // Forbidden
      }

      // Delete the collaboration
      const result = await this._collaborationService.deleteCollaboration(playlistId, userId);
      if (!result) {
        logger.warn(`Collaboration not found for playlist ${playlistId} and user ${userId}`);
        return h.response({ status: 'fail', message: 'Collaboration not found' }).code(404); // Not Found
      }

      return h.response({
        status: 'success',
        message: 'Collaboration deleted',
      }).code(200); // OK
    } catch (err) {
      if (err.message === 'Collaboration not found') {
        logger.warn(`Collaboration not found for playlist ${playlistId} and user ${userId}`);
        return h.response({ status: 'fail', message: 'Collaboration not found' }).code(404); // Not Found
      }

      logger.error(`Error deleting collaboration: ${err.message}`);
      return h.response({ status: 'error', message: 'Internal Server Error' }).code(500); // Internal Server Error
    }
  }
}

module.exports = CollaborationsHandler;
