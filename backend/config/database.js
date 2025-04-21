// config/database.js
require('dotenv').config();
const sql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASS || 'Dangkhoi123',
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  database: process.env.DB_NAME || 'Graptify',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

let poolPromise;

async function getPool() {
  if (!poolPromise) {
    try {
      poolPromise = sql.connect(dbConfig);
      await poolPromise;
      console.log('✅ Kết nối DB MSSQL thành công!');
    } catch (err) {
      console.error('❌ Lỗi kết nối DB:', err);
      poolPromise = null;
      throw err;
    }
  }
  return poolPromise;
}

module.exports = {
  sql,
  getPool,
};
