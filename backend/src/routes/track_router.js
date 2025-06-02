import express from 'express';
import multer from 'multer';
import {
    getAllTracksController,
    getTrackByIdController,
    createTrackController,
    updateTrackController,
    deleteTrackController,
    getTrackWithUploaderByIdController,
    getMyTracksController,
    getPublicTracksOfUserController
} from '../controllers/trackController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
// import { uploadTrackImage} from "../middleware/uploadMiddleware.js";
import { uploadTrackFields, uploadTrackImage  } from '../middleware/uploadMiddleware.js';


const router = express.Router();


router.get('/tracks', getAllTracksController);
router.get('/tracks/getmytracks', authenticateUser, getMyTracksController);
router.get('/tracks/user/:userId', getPublicTracksOfUserController);
router.get('/tracks/:id', getTrackByIdController);
router.get('/trackswithuploader/:id', getTrackWithUploaderByIdController);
router.post('/tracks/create-track',authenticateUser, uploadTrackFields, createTrackController);
router.put('/tracks/update-track/:id', authenticateUser,uploadTrackImage, updateTrackController);
router.delete('/tracks/:id',authenticateUser, deleteTrackController);

export default router;
