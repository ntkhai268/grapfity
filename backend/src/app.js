require('dotenv').config();
const { getPool, getUsers } = require('./config/database');

async function startApp() {
  try {
    const pool = await getPool();
    console.log('Ứng dụng đã sẵn sàng!');

    const users = await getUsers();
    console.log('Danh sách người dùng từ bảng Users:');
    console.table(users);
  } catch (err) {
    console.error('Lỗi khởi động ứng dụng:', err);
  }
}

startApp();