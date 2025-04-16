require('dotenv').config() //đọc file .env và lưu vào biến process.env 
const express = require('express') //đây là commonjs module: const <tên hàm> = require('<tên file module>')
const apiRoutes = require('./routes/api') //import router từ file api.js
const db = require('./models/') //import db từ file index.js trong thư mục models
const session = require('express-session');
var passport = require('passport');
require('./config/passport')(passport); 

const app = express() 
const port = process.env.PORT
const hostname = process.env.HOSTNAME

//config body-parser middleware để parse dữ liệu từ request body
app.use(express.json()) //parse dữ liệu từ request body với định dạng json
app.use(express.urlencoded({ extended: true })) //parse dữ liệu từ request body với định dạng urlencoded

app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//test kết nối database
db();

app.listen(port, hostname, () => {
  console.log(`Example app listening on port ${port}`)
})

app.use('/api', apiRoutes) //sử dụng router apiRoutes cho tất cả các route bắt đầu bằng /api

