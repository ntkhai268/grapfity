import express from 'express';
import {
  getListeningHistoryOfUserController,
  trackingListeningHistoryController,
  getAllListeningHistoryController   // import thêm
} from '../controllers/listeningHistoryController.js';

const router = express.Router();

router.get('/listening-history', getListeningHistoryOfUserController);
router.post('/track/:trackId/listen', trackingListeningHistoryController);
router.get('/listening-histories', getAllListeningHistoryController);
export default router;
