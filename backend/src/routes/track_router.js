import express from 'express';
import multer from 'multer';
import {
    getAllTracksController,
    getTrackByIdController,
    createTrackController,
    updateTrackController,
    deleteTrackController,
    getTrackWithUploaderByIdController,
    getMyUploadedTracksController
} from '../controllers/trackController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
// import { uploadTrackImage} from "../middleware/uploadMiddleware.js";
import { uploadTrackFields } from '../middleware/uploadMiddleware.js';


const router = express.Router();


router.get('/tracks', getAllTracksController);
router.get('/tracks/getmytracks', authenticateUser, getMyUploadedTracksController);
router.get('/tracks/:id', getTrackByIdController);
router.get('/trackswithuploader/:id', getTrackWithUploaderByIdController);

// router.post('/tracks/create-track',authenticateUser, upload.fields([
//     { name: 'audio', maxCount: 1 },
//     { name: 'image', maxCount: 1 },
// ]), createTrackController);
router.post('/tracks/create-track',authenticateUser, uploadTrackFields, createTrackController);
router.put('/tracks/update-track/:id', authenticateUser,uploadTrackFields, updateTrackController);
router.delete('/tracks/:id',authenticateUser, deleteTrackController);

export default router;
