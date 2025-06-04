import express from 'express';
import {
    getListeningHistoryOfUserController,
    trackingListeningHistoryController,
    getTop10PopularTracksController,
    getTop5TracksOfUserController,
    getTop5TracksByProfileController
} from '../controllers/listeningHistoryController.js';

const router = express.Router();

router.get('/listening-history', getListeningHistoryOfUserController);
router.post('/track/:trackId/listen', trackingListeningHistoryController);
router.get('/popular/top10', getTop10PopularTracksController);    // Toàn hệ thống
router.get('/popular/top5', getTop5TracksOfUserController);       // Riêng user hiện tại
router.get('/popular-user/:userId/top5', getTop5TracksByProfileController); 

export default router;
