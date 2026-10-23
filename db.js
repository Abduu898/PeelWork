require('dotenv').config(); // we load environment variables from .env file
const mysql = require('mysql2/promise'); // so we can be able to use await and async to conncet to the database

const requiredEnvironment = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);
if (missingEnvironment.length) {
  throw new Error(`Missing database environment variables: ${missingEnvironment.join(', ')}. Copy .env.example to .env and configure it.`);
}
// second we created a fast fail check to make sure that the required environment variables are set. If any of them are missing, we throw an error and stop the application from starting. This is important because if we try to connect to the database without the necessary information, it will fail and cause issues later on
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
// last thing here is a conncetion pool to keep 10 conncetions so incoming requests get processed faster 
module.exports = pool;