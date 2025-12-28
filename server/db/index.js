const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'gearguard',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit the process on a pool error so the server can continue running.
  // Routes should handle DB errors and return 5xx responses instead of crashing.
});

// Initialize database schema
const initializeDB = async () => {
  try {
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'schema.sql');
    
    // Check if schema file exists
    if (!fs.existsSync(schemaPath)) {
      console.log('Schema file not found, skipping initialization');
      return;
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    // Split by semicolons and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
        } catch (err) {
          // Ignore "already exists" errors
          if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
            console.warn('Schema initialization warning:', err.message);
          }
        }
      }
    }
    console.log('Database schema initialized');
  } catch (error) {
    console.error('Error initializing database:', error.message);
  }
};

module.exports = { pool, initializeDB };

