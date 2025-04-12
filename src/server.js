require('dotenv').config() //đọc file .env và lưu vào biến process.env 
const express = require('express') //đây là commonjs module: const <tên hàm> = require('<tên file module>')
const configViewEngine = require('./config/viewEngine') //import hàm configViewEngine từ file viewEngine.js
const webRoutes = require('./routes/web') //import router từ file web.js
const apiRoutes = require('./routes/api') //import router từ file api.js

const app = express() 
const port = process.env.PORT
const hostname = process.env.HOSTNAME

//config body-parser middleware để parse dữ liệu từ request body
app.use(express.json()) //parse dữ liệu từ request body với định dạng json
app.use(express.urlencoded({ extended: true })) //parse dữ liệu từ request body với định dạng urlencoded

configViewEngine(app) //gọi hàm configViewEngine để cấu hình template engine cho express

app.listen(port, hostname, () => {
  console.log(`Example app listening on port ${port}`)
})

app.use('', webRoutes)
app.use('/api', apiRoutes) //sử dụng router apiRoutes cho tất cả các route bắt đầu bằng /api

