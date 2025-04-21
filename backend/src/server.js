import dotenv from 'dotenv';
dotenv.config(); // Load biến môi trường từ .env
import express, { json, urlencoded } from 'express' //đây là commonjs module: const <tên hàm> = require('<tên file module>')
import router from './routes/api.js' //import router từ file api.js
import db from './models/index.js' //import db từ file index.js trong thư mục models
import cookieParser from 'cookie-parser'
import cors from 'cors'


const app = express() 
const port = process.env.PORT
const hostname = process.env.HOSTNAME

app.use(cors({
  origin: 'http://localhost:5173', // 👈 domain frontend
  credentials: true // nếu bạn dùng cookies hoặc header xác thực
}));

app.use(json()) //parse dữ liệu từ request body với định dạng json
app.use(urlencoded({ extended: true })) //parse dữ liệu từ request body với định dạng urlencoded

app.use(cookieParser());

app.use('/api', router)
//test kết nối database
db.connectToDB()

app.listen(port, hostname, () => {
  console.log(`Example app listening on port ${port}`)
})

