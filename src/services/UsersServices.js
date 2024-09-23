// src/services/UsersService.js
const db = require('./db');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');

class UsersService {
  async addUser({ username, password, fullname }) {
    // Check if the username already exists
    const existingUserQuery = {
      text: 'SELECT id FROM users WHERE username = $1',
      values: [username],
    };
    const existingUser = await db.query(existingUserQuery.text, existingUserQuery.values);

    if (existingUser.rows.length > 0) {
      throw new Error('Username already taken');
    }

    // Generate a unique ID for the user
    const id = `user-${nanoid(16)}`;

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const query = {
      text: 'INSERT INTO users (id, username, password, fullname) VALUES ($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const result = await db.query(query);

    // Check if the user was successfully added
    if (!result.rows[0].id) {
      throw new Error('User could not be added');
    }

    return result.rows[0].id;
  }

  async verifyUserCredential({ username, password }) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const result = await db.query(query);

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const { id, password: hashedPassword } = result.rows[0];
    const isValid = await bcrypt.compare(password, hashedPassword);

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    return id;
  }

  async getUserById(userId) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await db.query(query);

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  }
}

module.exports = UsersService;
