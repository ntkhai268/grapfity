import express from 'express';
import {
    getListeningHistoryOfUserController,
    trackingListeningHistoryController
} from '../controllers/listeningHistoryController.js';

const router = express.Router();

router.get('/listening-history', getListeningHistoryOfUserController);
router.post('/track/:trackId/listen', trackingListeningHistoryController);

export default router;
