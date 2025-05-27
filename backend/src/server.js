import dotenv from 'dotenv';
dotenv.config();
import express, { json, urlencoded } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes/api.js';
import db from './models/index.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

// Sửa toán tử || thay vì |
const port = process.env.PORT || 8001;
const hostname = process.env.HOSTNAME || "0.0.0.0";

// Lấy đường dẫn thư mục
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cấu hình CORS an toàn hơn
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Chỉ định domain cụ thể
  credentials: true
}));

// Middleware
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Route test đã sửa
app.use('/api/test', (req, res) => {
  return res.send("test"); // Sửa thành res.send()
});

// Kết nối database (nên thêm try-catch)
try {
  await db.connectToDB();
  console.log('Database connected');
} catch (err) {
  console.error('Database connection failed:', err);
}

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