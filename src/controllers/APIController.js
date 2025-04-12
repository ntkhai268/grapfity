const connection = require('../config/database') //import connection từ file database.js
const sql = require('mssql') //import thư viện sql để sử dụng các hàm của nó
require('dotenv').config() //đọc file .env và lưu vào biến process.env 


// const getAllUsers = async (req, res) => {
//     try{
//         const pool = await connection;
//         const result = await pool.request().query('SELECT * FROM Users')
//         const users = result.recordset; //lấy dữ liệu từ bảng Users, recordset là một thuộc tính trong result (result) là một object, thử console.dir(result) để xem các thuộc tính của nó
//         return res.status(200).json({
//             message: 'Get all users succeed!',
//             data: users //trả về dữ liệu của user cần update
//         })
//     }
//     catch (err) {
//         console.error('Database connection failed:', err) //log lỗi ra console
//         res.status(500).send('Internal Server Error') //gửi lỗi 500 về client
//     }
// }

// const createUser = async(req, res) => {
//     let { username, email, password } = req.body //lấy các giá trị từ body của request
//     if (!username || !email || !password) {
//         return res.status(400).json({
//             message: 'Missing required fields'
//         })
//     }
//     try{
//         const pool = await connection;
//        const result = await pool.request()
//             .input('UserName', sql.NVarChar, username)
//             .input('Email', sql.NVarChar, email)
//             .input('Password', sql.NVarChar, password)
//             .query('INSERT INTO Users (UserName, Email, Password) VALUES (@UserName, @Email, @Password)')
//         const users = result.recordset;
//         return res.status(200).json({
//             message: 'Create user succeed!',
//             data: users //trả về dữ liệu của user vừa tạo
//         })
//     }
//     catch (err) {
//         console.error('Database connection failed:', err) //log lỗi ra console
//         res.status(500).send('Internal Server Error') //gửi lỗi 500 về client
//     }
// }

// const updateUser = async (req, res) => {
//     let { id, username, email, password } = req.body //lấy các giá trị từ body của request
//     if (!id || !username || !email || !password) {
//         return res.status(400).json({
//             message: 'Missing required fields'
//         })
//     }
//     try{
//         const pool = await connection;
//        const result = await pool.request()
//             .input('UserID', sql.Int, id)
//             .input('UserName', sql.NVarChar, username)
//             .input('Email', sql.NVarChar, email)
//             .input('Password', sql.NVarChar, password)
//             .query('UPDATE Users SET UserName = @UserName, Email = @Email, Password = @Password WHERE UserID = @UserID')
//         const users = result.recordset;
//         return res.status(200).json({
//             message: 'Update user succeed!',
//         })
//     }
//     catch (err) {
//         console.error('Database connection failed:', err) //log lỗi ra console
//         res.status(500).send('Internal Server Error') //gửi lỗi 500 về client
//     }
// }

// const deleteUser = async (req, res) => {
//     let id = req.params.id //lấy các giá trị từ body của request
//     if (!id) {
//         return res.status(400).json({
//             message: 'Missing required fields'
//         })
//     }
//     try{
//         const pool = await connection;
//         const result = await pool.request()
//             .input('UserID', sql.Int, id)
//             .query('DELETE FROM Users WHERE UserID = @UserID')
//         return res.status(200).json({
//             message: 'Delete user succeed!',
//         })
//     }
//     catch (err) {
//         console.error('Database connection failed:', err) //log lỗi ra console
//         res.status(500).send('Internal Server Error') //gửi lỗi 500 về client
//     }
// }

// module.exports = {
//     getAllUsers,
//     createUser,
//     updateUser,
//     deleteUser
// }

