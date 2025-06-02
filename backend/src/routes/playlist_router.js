// src/routes/playlistRouter.js
import express from 'express';

// 1. Import ĐẦY ĐỦ các controller cần thiết
import {
    getMyPlaylistsController,
    getPublicPlaylistsController,
    getAllPublicPlaylistsController,
    createPlaylistController,
    deletePlaylistController,
    updatePlaylistController,
    uploadPlaylistCoverController
 
} from '../controllers/playlistController.js';

// Import middleware xác thực
import { authenticateUser } from '../middleware/authMiddleware.js';
import {uploadPlaylistImage} from "../middleware/uploadMiddleware.js";


const router = express.Router();

// --- Định nghĩa Routes ---

// GET / -> Lấy playlist của người dùng đã đăng nhập
router.get('/', authenticateUser, getMyPlaylistsController);
router.get('/user/:userId', getPublicPlaylistsController);
router.get('/public', getAllPublicPlaylistsController); // GET /api/playlists/public

// POST / -> Tạo playlist mới
router.post('/', authenticateUser, createPlaylistController);

// // GET /:playlistId -> Lấy chi tiết playlist theo ID
// router.get('/:playlistId', /* authenticateUser, */ getPlaylistByIdController);

// PUT /:playlistId -> Cập nhật playlist theo ID
router.put('/:playlistId', authenticateUser, updatePlaylistController);

// --- THÊM ROUTE MỚI CHO UPLOAD ẢNH ---
// Sử dụng POST hoặc PUT tùy ý, dùng POST thường hợp lý hơn cho việc tạo tài nguyên mới (ảnh)
router.post(
    '/:playlistId/upload-cover', // Đường dẫn riêng cho việc upload ảnh bìa
    authenticateUser,           // Cần xác thực người dùng
    uploadPlaylistImage,        // Middleware multer xử lý file upload trước controller
    uploadPlaylistCoverController // Controller xử lý sau khi ảnh đã được upload
);



// (Tùy chọn) Route xóa playlist
router.delete('/:playlistId', authenticateUser, deletePlaylistController);


export default router; // Export router theo chuẩn ES module
