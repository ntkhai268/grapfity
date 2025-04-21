import express from 'express';
import {
    getAllTracksController,
    createTrackController,
    updateTrackController,
    deleteTrackController,
    getTrackWithUploaderByIdController
} from '../controllers/trackController.js';

const router = express.Router();

router.get('/tracks', getAllTracksController);
router.get('/trackswithuploader/:id', getTrackWithUploaderByIdController);
router.post('/create-track', createTrackController);
router.put('/update-track', updateTrackController);
router.delete('/delete-track/:id', deleteTrackController);

export default router;
