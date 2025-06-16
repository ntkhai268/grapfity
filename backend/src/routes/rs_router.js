import express from 'express';
import {
  getHomeRecommendationsController,
  getTrackRecommendationsController,
} from '../controllers/rsController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/recommend/home/', authenticateUser, getHomeRecommendationsController);
router.get('/recommend/track/:trackId', getTrackRecommendationsController);

export default router;
