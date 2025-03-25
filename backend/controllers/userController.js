// controllers/userController.js
const { sql, getPool } = require('../config/database');

// ✅ Hàm dùng để in ra bảng Users khi khởi chạy app
async function getAllUsersRaw() {
  const pool = await getPool();
  const result = await pool.request().query('SELECT * FROM Users');
  return result.recordset;
}

// ✅ Lấy tất cả Users (cho API GET /api/users)
async function getAllUsers(req, res) {
  try {
    const users = await getAllUsersRaw();
    res.json(users);
  } catch (err) {
    console.error('❌ Lỗi getAllUsers:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// ✅ Lấy 1 User theo ID (GET /api/users/:id)
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const result = await pool.request()
      .input('UserID', sql.Int, id)
      .query('SELECT * FROM Users WHERE UserID = @UserID');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('❌ Lỗi getUserById:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// ✅ Tạo mới User (POST /api/users)
async function createUser(req, res) {
  try {
    const { Username, Email, Password, Note } = req.body;

    if (!Username || !Email || !Password) {
      return res.status(400).json({ error: 'Thiếu thông tin Username, Email hoặc Password' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('Username', sql.VarChar(255), Username)
      .input('Email', sql.VarChar(255), Email)
      .input('Password', sql.VarChar(255), Password)
      .input('Note', sql.VarChar(255), Note || null)
      .query(`
        INSERT INTO Users (Username, Email, Password, Note)
        VALUES (@Username, @Email, @Password, @Note);
        SELECT SCOPE_IDENTITY() AS NewUserID;
      `);

    const newUserID = result.recordset[0].NewUserID;
    res.status(201).json({ message: 'User created successfully', UserID: newUserID });
  } catch (err) {
    if (err.originalError && err.originalError.info && err.originalError.info.number === 2627) {
      // Unique constraint violation (Email trùng)
      return res.status(409).json({ error: 'Email đã tồn tại' });
    }

    console.error('❌ Lỗi createUser:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// ✅ Cập nhật User (PUT /api/users/:id)
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { Username, Email, Password, Note } = req.body;

    if (!Username || !Email || !Password) {
      return res.status(400).json({ error: 'Thiếu thông tin Username, Email hoặc Password' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('UserID', sql.Int, id)
      .input('Username', sql.VarChar(255), Username)
      .input('Email', sql.VarChar(255), Email)
      .input('Password', sql.VarChar(255), Password)
      .input('Note', sql.VarChar(255), Note || null)
      .query(`
        UPDATE Users
        SET Username = @Username,
            Email = @Email,
            Password = @Password,
            Note = @Note
        WHERE UserID = @UserID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    if (err.originalError && err.originalError.info && err.originalError.info.number === 2627) {
      return res.status(409).json({ error: 'Email đã tồn tại' });
    }

    console.error('❌ Lỗi updateUser:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// ✅ Xoá User (DELETE /api/users/:id)
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const result = await pool.request()
      .input('UserID', sql.Int, id)
      .query('DELETE FROM Users WHERE UserID = @UserID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('❌ Lỗi deleteUser:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  getAllUsersRaw,  // dùng để in bảng ra console khi app khởi chạy
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
