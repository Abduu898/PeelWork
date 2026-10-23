require('dotenv').config();
const mysql = require('mysql2/promise');

const requiredEnvironment = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);
if (missingEnvironment.length) {
  throw new Error(`Missing database environment variables: ${missingEnvironment.join(', ')}. Copy .env.example to .env and configure it.`);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;