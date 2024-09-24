const db = require('./db');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger'); // Import logger

class UsersService {
  async addUser({ email, username, password, fullname }) {
    const existingUserQuery = {
      text: 'SELECT id, username, email FROM users WHERE username = $1 OR email = $2',
      values: [username, email],
    };
    const existingUser = await db.query(existingUserQuery.text, existingUserQuery.values);
    
  if (existingUser.rows.length === 0) {
    logger.info('No Existing users found with the provided username or email');
  } else {
    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];
      if (existing.username.toLowerCase() === username.toLowerCase()) {
        logger.warn('Attempt to register with a taken username');
        throw new Error('Username already taken');
      }
      if (existing.email.toLowerCase() === email.toLowerCase()) {
        logger.warn('Attempt to register with a taken email');
        throw new Error('Email already taken');
      }
    }
  }

    if (!email) {
      logger.error('Attempt to register without email');
      throw new Error('Email cannot be null');
    }

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: 'INSERT INTO users (id, username, email, password, fullname) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, username, email, hashedPassword, fullname],
    };

    const result = await db.query(query);

    if (!result.rows[0].id) {
      logger.error('User could not be added');
      throw new Error('User could not be added');
    }

    logger.info(`User registered with ID: ${result.rows[0].id}`);
    return result.rows[0].id;
  }

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

  async getUserById(userId) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await db.query(query);

    if (result.rows.length === 0) {
      logger.warn(`User with ID: ${userId} not found`);
      throw new Error('User not found');
    }

    logger.info(`Fetched user with ID: ${userId}`);
    return result.rows[0];
  }

  async getAllUsers() {
    const query = {
      text: 'SELECT id, username, fullname FROM users',
    };

    const result = await db.query(query);
    logger.info('Fetched all users');
    return result.rows;
  }
}

module.exports = UsersService;
