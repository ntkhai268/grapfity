import express from 'express';
import {
    addTrackToPlaylistController,
    removeTrackFromPlaylistController,
    getTracksInPlaylistController
} from '../controllers/playlistTrackController.js';

const router = express.Router();

router.get('/playlists/:playlistId/tracks', getTracksInPlaylistController);
router.post('/playlists/:playlistId/add-track', addTrackToPlaylistController);
router.delete('/playlists/:playlistId/delete-track', removeTrackFromPlaylistController);

export default router;
