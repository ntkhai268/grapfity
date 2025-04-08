// controllers/authController.js
const { OAuth2Client } = require('google-auth-library');
const { sql, getPool } = require('../config/database');

const client = new OAuth2Client('806916828607-7d3ookn22cupeq0gk62madphn6gp3q9f.apps.googleusercontent.com');

const handleGoogleLogin = async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: '806916828607-7d3ookn22cupeq0gk62madphn6gp3q9f.apps.googleusercontent.com',
    });

    const payload = ticket.getPayload();
    const { email, name, sub } = payload;

    const pool = await getPool();

    // Kiểm tra email có tồn tại trong Users chưa
    const result = await pool
      .request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email');

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      return res.status(200).json({ message: 'Đăng nhập thành công', user });
    }

    // Nếu chưa có, tạo user mới
    const username = email.split('@')[0];
    const note = 'Google user';

    await pool
      .request()
      .input('username', sql.VarChar, username)
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, '') // không dùng password cho tài khoản google
      .input('note', sql.VarChar, note)
      .query('INSERT INTO Users (Username, Email, Password, Note) VALUES (@username, @email, @password, @note)');

    const newUser = await pool
      .request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email');

    return res.status(201).json({ message: 'Tạo tài khoản thành công', user: newUser.recordset[0] });
  } catch (err) {
    console.error('❌ Google login error:', err);
    return res.status(401).json({ error: 'Xác thực Google thất bại' });
  }
};

module.exports = {
  handleGoogleLogin,
};
