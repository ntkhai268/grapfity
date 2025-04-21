import express from 'express';
import {
    getAllPlaylistsByUserIdController,
    createPlaylistController,
    updatePlaylistController
} from '../controllers/playlistController.js';

const router = express.Router();

router.get('/playlist', getAllPlaylistsByUserIdController); // Get all playlists
router.post('/create-playlist/', createPlaylistController); // Create playlist
router.put('/update-playlist/', updatePlaylistController);  // Update playlist

export default router; // Export router theo chuẩn ES module
