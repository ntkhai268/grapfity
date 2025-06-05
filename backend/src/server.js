import dotenv from 'dotenv';
dotenv.config();
import express, { json, urlencoded } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes/api.js';
import db from './models/index.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mime from 'mime-types';
import fs from 'fs';

const app = express();


const port = process.env.PORT || 8001;
const hostname = process.env.HOSTNAME || "0.0.0.0";

// Lấy đường dẫn thư mục
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app.use(cors({
//   origin: 'http://localhost:5173', // chính xác origin React app
//   credentials: true
// }));

// // Đảm bảo Express xử lý OPTIONS
// app.options('/*', cors()); // để xử lý preflight OPTIONS


app.use(json()); // Parse dữ liệu từ request body với định dạng json
app.use(urlencoded({ extended: true })); // Parse dữ liệu từ request body với định dạng urlencoded
app.use(express.json());    
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Kết nối database 
try {
  await db.connectToDB();
  console.log('Database connected');
} catch (err) {
  console.error('Database connection failed:', err);
}

app.use('/api', router); // Định nghĩa các route API SAU middleware static

// Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});
