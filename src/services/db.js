// services/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'openmusic',
  password: process.env.DB_PASSWORD || 'r',
  port: process.env.DB_PORT || 5432,
});

// Test connection
pool.connect((err) => {
  if (err) {
    console.error('Failed to connect to the database:', err);
  } else {
    console.log('Connected to the PostgreSQL database successfully!');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
