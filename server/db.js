const { Pool } = require('pg');

// Create a connection pool using the DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a sql object for executing SQL queries
const sql = {
  query: (text, params) => pool.query(text, params),
};

// Test the database connection
pool.on('connect', () => {
  console.log('PostgreSQL database connected');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err.message);
});

// Export the sql object for use in other modules
module.exports = { sql, pool };