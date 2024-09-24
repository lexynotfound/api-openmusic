const db = require('./db');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const dotenv = require('dotenv');
dotenv.config();

class AuthService {
  async verifyUserCredential({ username, password }) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const result = await db.query(query);

    if (result.rows.length === 0) {
      logger.warn('Invalid login credentials for username: ' + username);
      throw new Error('Invalid credentials');
    }

    const { id, password: hashedPassword } = result.rows[0];
    const isValid = await bcrypt.compare(password, hashedPassword);

    if (!isValid) {
      logger.warn('Invalid password for username: ' + username);
      throw new Error('Invalid credentials');
    }

    logger.info(`Login successful for user ID: ${id}`);
    return id;
  }

  async generateAccessToken(userId) {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1h' });
    return accessToken;
  }

  async generateRefreshToken(userId) {
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_KEY);
    return refreshToken;
  }

  async saveRefreshToken(token, userId) {
    const id = `user-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO authentication (id, token, users_id) VALUES ($1, $2, $3)', // Removed the id column
      values: [id, token, userId],
    };

    await db.query(query);
    logger.info(`Refresh token saved for user ID: ${userId}`);
  }

  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentication WHERE token = $1',
      values: [token],
    };

    await db.query(query);
    logger.info(`Refresh token deleted: ${token}`);
  }

  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT * FROM authentication WHERE token = $1',
      values: [token],
    };

    const result = await db.query(query);

    if (result.rows.length === 0) {
      logger.warn('Invalid refresh token: ' + token);
      throw new Error('Invalid refresh token');
    }

    return result.rows[0].users_id;
  }
}

module.exports = AuthService;
