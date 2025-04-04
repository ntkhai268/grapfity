require('dotenv').config() //đọc file .env và lưu vào biến process.env 
const express = require('express') //đây là commonjs module: const <tên hàm> = require('<tên file module>')
const configViewEngine = require('./config/viewEngine') //import hàm configViewEngine từ file viewEngine.js
const webRoutes = require('./routes/web') //import router từ file web.js

const app = express() 
const port = process.env.PORT
const hostname = process.env.HOSTNAME

configViewEngine(app) //gọi hàm configViewEngine để cấu hình template engine cho express

app.use('/', webRoutes)

app.listen(port, hostname, () => {  
  console.log(`Example app listening on port ${port}`)
})