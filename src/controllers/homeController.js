const connection = require('../config/database') //import connection từ file database.js
const sql = require('mssql') //import thư viện sql để sử dụng các hàm của nó
require('dotenv').config() //đọc file .env và lưu vào biến process.env 

const getHomepage = (req, res) => {
    res.render('homepage.ejs') //render file homepage.ejs
}

const getABC = async (req, res) => {
    try {
        const pool = await connection;
        const result = await pool.request().query('SELECT * FROM Users')
        const users = result.recordset; //lấy dữ liệu từ bảng Users
        console.log(users); //log ra dữ liệu
        res.render('sample.ejs', { users }); //render file sample.ejs và truyền dữ liệu vào
    }
    catch (err) {
        console.error('Database connection failed:', err)
        res.status(500).send('Internal Server Error') //gửi lỗi 500 về client
    }
}

const getCreateUser = (req, res) => {
    res.render('create.ejs') //render file create.ejs
}

const postCreateUser = async (req, res) => {
    console.log(req.body); //log ra body của request
    let { username, email, password } = req.body //lấy các giá trị từ body của request
    try {
        const pool = await connection;
        const result = await pool.request()
            .input('UserName', sql.NVarChar, username)
            .input('Email', sql.NVarChar, email)
            .input('Password', sql.NVarChar, password)
            .query('INSERT INTO Users (UserName, Email, Password) VALUES (@UserName, @Email, @Password)')
        const users = result.recordset; //lấy dữ liệu từ bảng Users
        console.log(users); //log ra dữ liệu
        res.send('Create user succeed!')
    }
    catch (err) {
        console.error('Database connection failed:', err) //log lỗi ra console
        res.status(500).send('Internal Server Error') //gửi lỗi 500 về client
    }
    //insert into Users (UserName, Email, Password) values ('Thanh Khai', 'khai@gmail.com', '123456')
}

const getUserById = async (req, res) => {
    try {
        const pool = await connection;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id) //lấy id từ params
            .query('SELECT * FROM Users WHERE UserID = @id') //lấy dữ liệu của user cần update
        const user = result.recordset[0]; //lấy dữ liệu của user cần update
        return user; //trả về dữ liệu của user cần update
    }
    catch (err) {
        console.error('Database connection failed:', err) //log lỗi ra console
        res.status(500).send('Internal Server Error') //gửi lỗi 500 về client
    }
}

const getUpdateUser = async (req, res) => {
    const user = await getUserById(req, res); //lấy dữ liệu của user cần update
    console.log(user); //log ra dữ liệu của user cần update
    res.render('update.ejs', { user }) //render file update.ejs
}

const postUpdateUser = async (req, res) => {
    console.log(req.params.id); //log ra body của request
    try {
        const pool = await connection;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id) //lấy id từ params
            .input('UserName', sql.NVarChar, req.body.username) //lấy username từ body
            .input('Email', sql.NVarChar, req.body.email) //lấy email từ body
            .input('Password', sql.NVarChar, req.body.password) //lấy password từ body
            .query('UPDATE Users SET UserName = @UserName, Email = @Email, Password = @Password WHERE UserID = @id') //update dữ liệu của user
        const users = result.recordset; //lấy dữ liệu từ bảng Users
        console.log(users); //log ra dữ liệu
        res.send('Update user succeed!')
    }
    catch (err) {
        console.error('Database connection failed:', err) //log lỗi ra console
        res.status(500).send('Internal Server Error') //gửi lỗi 500 về client
    }
}

module.exports = {
    getHomepage,
    getABC,
    postCreateUser,
    getCreateUser,
    getUpdateUser,
    postUpdateUser
}