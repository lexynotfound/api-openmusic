const jwt = require('jsonwebtoken'); // Make sure to include jwt for token generation
const loginValidator = require('../../validators/loginValid'); // Import login validator
const logger = require('../../utils/logger'); // Import your logger
const dotenv = require('dotenv');
dotenv.config();

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    // Bind functions to ensure the correct `this` context
    this.addUser = this.addUser.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    // this.login = this.login.bind(this);
    // this.refreshToken = this.refreshToken.bind(this); // Bind handler untuk refresh token
    // this.deleteToken = this.deleteToken.bind(this); // Bind handler untuk deleteToken
  }

  // Add a user
  async addUser(request, h) {
    const { error, value } = this._validator.validate(request.payload);
    if (error) {
      logger.error(`User validation failed: ${error.details[0].message}`);
      return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    try {
      const { email, username, password, fullname } = value;
      const userId = await this._service.addUser({ email, username, password, fullname });
      logger.info(`User added with ID: ${userId}`);
      return h.response({ status: 'success', data: { userId } }).code(201);
    } catch (err) {
      logger.error(`Error adding user: ${err.message}`);
      if (err.message === 'Username already taken' || err.message === 'Email already taken') {
        return h.response({ status: 'fail', message: err.message }).code(400);
      }
      return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
  }

  // Login
  // async login(request, h) {
  //   const { error, value } = loginValidator.validate(request.payload);
  //   if (error) {
  //     logger.warn(`Login validation failed: ${error.details[0].message}`);
  //     return h.response({ status: 'fail', message: error.details[0].message }).code(400);
  //   }

  //   try {
  //     const userId = await this._service.verifyUserCredential(value);
  //     const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1h' });
  //     const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_KEY);
  //     logger.info(`User logged in successfully with ID: ${userId}`);
  //     return h.response({ status: 'success', data: { accessToken, refreshToken } }).code(201);
  //   } catch (err) {
  //     logger.warn(`Invalid login attempt: ${err.message}`);
  //     return h.response({ status: 'fail', message: 'Invalid credentials' }).code(401);
  //   }
  // }

  // // Refresh Token
  // async refreshToken(request, h) {
  //   const { refreshToken } = request.payload;

  //   try {
  //     // Verifikasi refresh token
  //     const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
  //     const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1h' });

  //     return h.response({
  //       status: 'success',
  //       data: {
  //         accessToken: newAccessToken,
  //       },
  //     }).code(200);
  //   } catch (err) {
  //     return h.response({
  //       status: 'fail',
  //       message: 'Invalid refresh token',
  //     }).code(400);
  //   }
  // }

  // // Delete Token
  // async deleteToken(request, h) {
  //   const { refreshToken } = request.payload;

  //   try {
  //     // Biasanya token akan dihapus dari database atau blacklist
  //     // Namun, jika Anda tidak menyimpan token di database, maka cukup respons saja
  //     return h.response({
  //       status: 'success',
  //       message: 'Token has been removed',
  //     }).code(200);
  //   } catch (err) {
  //     return h.response({
  //       status: 'fail',
  //       message: 'Failed to remove token',
  //     }).code(400);
  //   }
  // }

  // Get user by ID
  async getUserById(request, h) {
    const { id } = request.params;
    logger.info(`Received request to get user by ID: ${id}`);

    try {
      const user = await this._service.getUserById(id);
      logger.info(`Successfully fetched user with ID: ${id}`);
      return h.response({
        status: 'success',
        data: { user },
      }).code(200);
    } catch (err) {
      if (err.message === 'User not found') {
        logger.warn(`User with ID: ${id} not found`);
        return h.response({
          status: 'fail',
          message: 'User not found',
        }).code(404);
      }
      logger.error(`Error fetching user with ID: ${id}`, err);
      return h.response({
        status: 'error',
        message: 'Internal Server Error',
        details: err.message || 'Unknown error',
      }).code(500);
    }
  }

  // Get all users
  async getAllUsers(request, h) {
    try {
      const users = await this._service.getAllUsers();
      logger.info('Successfully fetched all users');
      return h.response({
        status: 'success',
        data: { users },
      }).code(200);
    } catch (err) {
      logger.error('Error fetching users', err);
      return h.response({
        status: 'error',
        message: 'Internal Server Error',
        details: err.message || 'Unknown error',
      }).code(500);
    }
  }
}

module.exports = UsersHandler;
