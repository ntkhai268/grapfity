import dotenv from 'dotenv';
dotenv.config(); // Load biến môi trường từ .env
import express, { json, urlencoded } from 'express'; // Import express và middleware
import path from 'path'; // <-- THÊM IMPORT NÀY
import { fileURLToPath } from 'url'; // <-- THÊM IMPORT NÀY (nếu dùng ES Modules)
import router from './routes/api.js'; // Import router từ file api.js
import db from './models/index.js'; // Import db từ file index.js trong thư mục models
import cookieParser from 'cookie-parser';
import cors from 'cors';
const app = express();
const port = process.env.PORT;
const hostname = process.env.HOSTNAME;

// --- LẤY ĐƯỜNG DẪN THƯ MỤC HIỆN TẠI ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log('Serving static files from directory:', path.join(__dirname, 'public')); // Log đường dẫn để kiểm tra
// --------------------------------------

app.use(cors({
  origin: 'http://localhost:5173',
  // 👈 domain frontend
  credentials: true // nếu bạn dùng cookies hoặc header xác thực
}));
app.use(json()); // Parse dữ liệu từ request body với định dạng json
app.use(urlencoded({
  extended: true
})); // Parse dữ liệu từ request body với định dạng urlencoded
app.use(express.json());
app.use(cookieParser());

// --- PHỤC VỤ FILE TĨNH TỪ THƯ MỤC 'public' ---
// Middleware này phải được đặt TRƯỚC app.use('/api', router)
app.use(express.static(path.join(__dirname, 'public')));
// Giờ đây, yêu cầu GET /assets/track_image/ten_anh.jpg sẽ được phục vụ từ thư mục public/assets/track_image
// --------------------------------------------

app.use('/api', router); // Định nghĩa các route API SAU middleware static

// Test kết nối database
db.connectToDB();
app.listen(port, hostname, () => {
  console.log(`Example app listening on port ${port}`);
});