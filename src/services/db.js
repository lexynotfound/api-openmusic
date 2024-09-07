const { Pool } = require('pg');
require('dotenv').config();

let pool;

try {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    pool.on('connect', () => {
        console.log('Connected to the database successfully.');
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
    });
} catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
}

module.exports = pool;
