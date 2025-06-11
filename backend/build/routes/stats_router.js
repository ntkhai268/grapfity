import express from 'express';
import { getRecentlyTracksController } from '../controllers/statsController.js';
const router = express.Router();
router.get('/stats/recent-tracks', getRecentlyTracksController); // Get all playlists

export default router; // Export router theo chuẩn ES module