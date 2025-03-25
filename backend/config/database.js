require('dotenv').config();
const sql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASS || "MyPassword#321",
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'Graptify',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

console.log('DB Config:', {
  server: dbConfig.server,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database
});

let poolPromise;

async function getPool() {
  if (!poolPromise) {
    try {
      poolPromise = sql.connect(dbConfig);
      await poolPromise; // Đợi kết nối thành công
      console.log('Kết nối DB MSSQL thành công');
    } catch (err) {
      console.error('Lỗi kết nối DB:', err);
      poolPromise = null; // Reset nếu lỗi
      throw err;
    }
  }
  return poolPromise;
}

async function getUsers() {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Users');
    return result.recordset;
  } catch (err) {
    console.error('Lỗi khi truy vấn bảng Users:', err);
    throw err;
  }
}

module.exports = {
  sql,
  getPool,
  getUsers
};

async function checkConnection() {
  try {
    let pool = await sql.connect(dbConfig);
    console.log('DB_PASS from env =', process.env.DB_PASS);
    console.log('✅ Kết nối MSSQL thành công!');
    // Không đóng pool ở đây
  } catch (err) {
    console.error('❌ Lỗi kết nối MSSQL:', err.message);
  }
}

checkConnection();