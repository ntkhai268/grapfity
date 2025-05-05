// src/middleware/uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Lấy đường dẫn thư mục gốc của dự án backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.dirname(__filename)); // Đi lên 1 cấp

// --- THAY ĐỔI THƯ MỤC LƯU TRỮ ---
// Sử dụng đường dẫn bạn mong muốn
const uploadDir = path.join(__dirname, 'public', 'assets', 'track_image');
console.log('[Multer Config] Target Upload Directory:', uploadDir); // Thêm log này
// ---------------------------------

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created directory: ${uploadDir}`);
} else {
     console.log(`Upload directory already exists: ${uploadDir}`);
}


const storage = multer.diskStorage({
    // Nơi lưu file
    destination: function (req, file, cb) {
        console.log('[Multer Destination] Saving to:', uploadDir); // Thêm log
        cb(null, uploadDir); // <-- Lưu vào thư mục mới
    },
    // Đặt tên file mới (giữ nguyên logic tạo tên duy nhất)
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Sử dụng 'cover' hoặc một tiền tố khác thay vì fieldname nếu muốn
        cb(null, 'playlist-cover-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// --- Bộ lọc file: Chỉ chấp nhận ảnh (giữ nguyên) ---
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        console.warn(`Upload rejected: Invalid file type - ${file.mimetype}`);
        cb(new Error('Chỉ chấp nhận file ảnh (jpeg, png, gif)!'), false);
    }
};

// --- Tạo middleware multer (giữ nguyên field name 'playlistImage') ---
const uploadPlaylistImage = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 1024 * 1024 * 20 // Giới hạn 5MB
    }
}).single('playlistImage');

export default uploadPlaylistImage;
