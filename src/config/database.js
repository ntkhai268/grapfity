require('dotenv').config() //đọc file .env và lưu vào biến process.env 
const Connection = require('tedious').Connection;  //import thư viện tedious để kết nối với SQL Server
//test connection db
const config = {
    server: process.env.DB_SERVER,
    authentication: {
        type: 'default',
        options: {
            userName: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD
        }
    },
    options: {
        encrypt: process.env.DB_ENCRYPT === 'false',
        trustServerCertificate: true,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT || '1433')
    }
};

const connection = new Connection(config); //tạo kết nối với SQL Server

module.exports = connection;