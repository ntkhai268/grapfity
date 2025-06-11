// src/routes/uploadImageRouter.js
import express from 'express';
import multer from 'multer'; // Import multer
import path from 'path';
import fs from 'fs'; // Import fs để kiểm tra thư mục
import { fileURLToPath } from 'url'; // Để lấy __dirname trong ES Modules

// Import controller xử lý upload
import { uploadPlaylistImageController } from '../controllers/uploadController.js';
// Import middleware xác thực người dùng
import { authenticateUser } from '../middleware/authMiddleware.js';
const router = express.Router();

// --- Cấu hình Multer ---

// Xác định đường dẫn thư mục lưu trữ ảnh playlist
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Đi từ routes lên 1 cấp -> vào public -> uploads -> playlists
const playlistImageDir = path.resolve(__dirname, '../../public/uploads/playlists');

// Đảm bảo thư mục tồn tại
if (!fs.existsSync(playlistImageDir)) {
  fs.mkdirSync(playlistImageDir, {
    recursive: true
  });
  console.log(`Created directory for playlist images: ${playlistImageDir}`);
}

// Cấu hình nơi lưu trữ và tên file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, playlistImageDir); // Lưu vào thư mục đã định nghĩa
  },
  filename: function (req, file, cb) {
    // Tạo tên file duy nhất: playlist-userId-timestamp-random.ext
    // Lấy userId từ middleware authenticateUser đã chạy trước đó
    const userId = req.userId || 'unknown'; // Lấy userId từ req
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname); // Lấy phần mở rộng file (.png, .jpg)
    cb(null, `playlist-${userId}-${uniqueSuffix}${extension}`);
  }
});

// Bộ lọc file: Chỉ chấp nhận các định dạng ảnh phổ biến
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
    cb(null, true); // Chấp nhận file
  } else {
    // Từ chối file và tạo lỗi
    cb(new Error('Định dạng file không được hỗ trợ. Chỉ chấp nhận JPEG, PNG, GIF.'), false);
  }
};

// Tạo middleware upload của multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // Giới hạn kích thước file (ví dụ: 5MB)
  }
  // Sử dụng .single('fieldName') với 'fieldName' khớp với key trong FormData của frontend
  // Key này là 'playlistImage' như đã định nghĩa trong hàm uploadPlaylistImageAPI ở frontend service
}).single('playlistImage');

// Middleware xử lý lỗi từ Multer hoặc fileFilter
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Lỗi từ Multer (vd: file quá lớn - LIMIT_FILE_SIZE)
    console.error("Multer Error:", err.code, err.message);
    let message = `Lỗi tải lên: ${err.message}`;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Lỗi: Kích thước file quá lớn (tối đa 5MB).';
    }
    return res.status(400).json({
      error: message
    });
  } else if (err) {
    // Lỗi khác (vd: định dạng file không hợp lệ từ fileFilter)
    console.error("Upload Filter/Other Error:", err.message);
    return res.status(400).json({
      error: err.message
    });
  }
  // Nếu không có lỗi, tiếp tục chuỗi middleware
  next();
};

// --- Định nghĩa Route Upload ---

// POST /api/upload/playlist-image
// Route này sẽ được gắn vào app với tiền tố /api/upload
router.post('/playlist-image',
// Đường dẫn con sau /api/upload
authenticateUser,
// 1. Xác thực người dùng trước khi cho upload
(req, res, next) => {
  // 2. Middleware gọi multer để xử lý file
  upload(req, res, err => {
    // Chuyển lỗi (nếu có) từ multer sang middleware xử lý lỗi chung
    // Nếu không có lỗi multer thì req.file sẽ được tạo ra
    if (err) {
      // Gọi handleMulterError để xử lý lỗi từ multer (ví dụ: kích thước file)
      return handleMulterError(err, req, res, next);
    }
    // Nếu không có lỗi multer, đi tiếp tới middleware/controller tiếp theo
    next();
  });
},
// 3. Middleware handleMulterError cũng bắt lỗi từ fileFilter
// (Không cần gọi lại ở đây vì đã gọi trong callback của upload)
uploadPlaylistImageController // 4. Controller xử lý logic sau khi upload thành công
);
export default router;