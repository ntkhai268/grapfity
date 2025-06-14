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
const port = process.env.PORT;
const hostname = process.env.HOSTNAME;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log('Serving static files from directory:', path.join(__dirname, 'public'));

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true 
}));

app.use(json());
app.use(urlencoded({ extended: true })); // Parse dữ liệu từ request body với định dạng urlencoded
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
