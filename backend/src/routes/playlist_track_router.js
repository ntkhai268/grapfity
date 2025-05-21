import express from 'express';
import {
    addTrackToPlaylistController,
    removeTrackFromPlaylistController,
    // getTracksInPlaylistController
    getPlaylistDetailsController
} from '../controllers/playlistTrackController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Thêm authenticateUser nếu cần yêu cầu đăng nhập để xem
router.get('/playlists/:playlistId',  getPlaylistDetailsController);
// Controller sẽ lấy trackId từ req.body
router.post('/playlists/:playlistId/tracks', authenticateUser, addTrackToPlaylistController);
// Sử dụng đường dẫn RESTful hơn (có trackId), thêm middleware xác thực
// Controller sẽ lấy trackId từ req.params.trackId
router.delete('/playlists/:playlistId/tracks/:trackId', authenticateUser, removeTrackFromPlaylistController);

export default router;
