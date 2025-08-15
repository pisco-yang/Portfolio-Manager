const mysql = require('mysql2/promise');
require('dotenv').config();

// Use environment variables if available, otherwise use defaults
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'yang1999',
  database: process.env.DB_NAME || 'portfolio_manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    return;
  }
  console.log('✅ Connected to MySQL database');
  connection.release();
});

module.exports = pool;
