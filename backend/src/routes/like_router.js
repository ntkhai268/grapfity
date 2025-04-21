import express from 'express';
import {
    likeTrackController,
    getLikedTracksByUserController,
    unlikeTrackController
} from '../controllers/likeController.js';

const router = express.Router();

router.post('/track/:trackId/like', likeTrackController);
router.get('/likes', getLikedTracksByUserController);
router.delete('/track/:trackId/unlike', unlikeTrackController);

export default router;
