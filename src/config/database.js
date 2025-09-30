require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'db-beneficio-joven.cduggeegs0kv.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'Bn7QZb}~]rnxPw%',
  database: 'BeneficioJoven',
  ssl: { rejectUnauthorized: false },
  connectionLimit: 10
};

let pool;

const getConnection = async () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

module.exports = { getConnection };