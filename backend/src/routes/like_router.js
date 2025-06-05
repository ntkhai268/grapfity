import express from 'express';
import {
    likeTrackController,
    getLikedTracksByUserController,
    unlikeTrackController,
    isTrackLikedByUserController,
    countLikesForTrackController
} from '../controllers/likeController.js';

const router = express.Router();

router.post('/track/:trackId/like', likeTrackController);
router.get('/tracks/:trackId/is-liked', isTrackLikedByUserController);
router.get('/tracks/:trackId/like-count', countLikesForTrackController);
router.get('/likes/:userId', getLikedTracksByUserController);
router.delete('/track/:trackId/unlike', unlikeTrackController);


export default router;
