const jwt = require('jsonwebtoken');
const logger = require('../../utils/logger');

class AuthHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.login = this.login.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.logout = this.logout.bind(this);
  }

  async login(request, h) {
    const { error, value } = this._validator.validate(request.payload);
    if (error) {
      logger.warn(`Login validation failed: ${error.details[0].message}`);
      return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    try {
      const userId = await this._service.verifyUserCredential(value);
      const accessToken = await this._service.generateAccessToken(userId);
      const refreshToken = await this._service.generateRefreshToken(userId);

      // Save refresh token to database
      await this._service.saveRefreshToken(refreshToken, userId);

      logger.info(`User logged in successfully with ID: ${userId}`);
      return h.response({ status: 'success', data: { accessToken, refreshToken } }).code(201);
    } catch (err) {
      logger.warn(`Invalid login attempt: ${err.message}`);
      return h.response({ status: 'fail', message: 'Invalid credentials' }).code(401);
    }
  }

  async refreshToken(request, h) {
    const { refreshToken } = request.payload;
    try {
      const userId = await this._service.verifyRefreshToken(refreshToken);

      const newAccessToken = await this._service.generateAccessToken(userId);

      return h.response({ status: 'success', data: { accessToken: newAccessToken } }).code(200);
    } catch (err) {
      logger.warn(`Invalid refresh token: ${err.message}`);
      return h.response({ status: 'fail', message: 'Invalid refresh token' }).code(400);
    }
  }

  async logout(request, h) {
    const { refreshToken } = request.payload;

    try {
      await this._service.deleteRefreshToken(refreshToken);
      logger.info('User logged out and refresh token deleted');
      return h.response({ status: 'success', message: 'Successfully logged out' }).code(200);
    } catch (err) {
      logger.error(`Error logging out: ${err.message}`);
      return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
  }
}

module.exports = AuthHandler;
