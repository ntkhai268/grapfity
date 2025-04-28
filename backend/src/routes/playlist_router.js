// src/routes/playlistRouter.js
import express from 'express';

// 1. Import ĐẦY ĐỦ các controller cần thiết
import {
    getMyPlaylistsController,
    createPlaylistController,
    updatePlaylistController,
    getPlaylistByIdController // <-- Thêm import controller này
} from '../controllers/playlistController.js';

// Import middleware xác thực
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Định nghĩa Routes (Giả sử router này được gắn vào app với tiền tố /api/playlists) ---

// GET /api/playlists/ -> Lấy playlist của người dùng đã đăng nhập
router.get('/', authenticateUser, getMyPlaylistsController);

// POST /api/playlists/ -> Tạo playlist mới
router.post('/', authenticateUser, createPlaylistController);

// --- THÊM ROUTE GET /:id ---
// GET /api/playlists/:id -> Lấy chi tiết playlist theo ID
// Bỏ comment authenticateUser nếu việc xem cần đăng nhập
router.get('/:id', /* authenticateUser, */ getPlaylistByIdController); // <-- THÊM DÒNG NÀY

// PUT /api/playlists/:id -> Cập nhật playlist theo ID
router.put('/:id', authenticateUser, updatePlaylistController);

// DELETE /api/playlists/:id -> (Tùy chọn) Thêm route xóa playlist nếu cần
// router.delete('/:id', authenticateUser, deletePlaylistController);

export default router; // Export router theo chuẩn ES module
