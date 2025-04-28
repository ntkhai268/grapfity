// src/routes/playlistRouter.js
import express from 'express';

// 1. Import ĐẦY ĐỦ các controller cần thiết
import {
    getMyPlaylistsController,
    createPlaylistController,
    updatePlaylistController,
    getPlaylistByIdController,
    addTrackToPlaylistController,
    removeTrackFromPlaylistController // <<< BỎ COMMENT HOẶC THÊM DÒNG IMPORT NÀY
} from '../controllers/playlistController.js';

// Import middleware xác thực
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Định nghĩa Routes ---

// GET / -> Lấy playlist của người dùng đã đăng nhập
router.get('/', authenticateUser, getMyPlaylistsController);

// POST / -> Tạo playlist mới
router.post('/', authenticateUser, createPlaylistController);

// GET /:playlistId -> Lấy chi tiết playlist theo ID
router.get('/:playlistId', /* authenticateUser, */ getPlaylistByIdController);

// PUT /:playlistId -> Cập nhật playlist theo ID
router.put('/:playlistId', authenticateUser, updatePlaylistController);

// POST /:playlistId/tracks -> Thêm track vào playlist
router.post('/:playlistId/tracks', authenticateUser, addTrackToPlaylistController);

// DELETE /:playlistId/tracks/:trackId -> Xóa track khỏi playlist
router.delete('/:playlistId/tracks/:trackId', authenticateUser, removeTrackFromPlaylistController); // Dòng này giờ sẽ hoạt động

// (Tùy chọn) Route xóa playlist
// router.delete('/:playlistId', authenticateUser, deletePlaylistController);


export default router; // Export router theo chuẩn ES module
