const mysql = require('mysql2/promise'); /*to import mysql12*/ 
const pool = mysql.createPool({
  host: 'localhost',
  user: 'hireloop',
  password: 'password123',
  database: 'hireloop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;