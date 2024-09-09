const { Pool } = require('pg');

// Configure the connection pool using environment variables
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'openmusic',
  password: process.env.PGPASSWORD || 'r',
  port: process.env.PGPORT || 5432,
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
