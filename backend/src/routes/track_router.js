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
    getPublicTracksOfUserController,
    getJoinedTracksController,
    downloadTrackController,
    getTracksByUserController,

    getTracksByIdController
} from '../controllers/trackController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
// import { uploadTrackImage} from "../middleware/uploadMiddleware.js";
import { uploadTrackFields, uploadTrackImage  } from '../middleware/uploadMiddleware.js';


const router = express.Router();


router.get('/tracks', getAllTracksController);
router.post('/tracks/getTracksById', getTracksByIdController)
router.get('/tracks/getmytracks', authenticateUser, getMyTracksController);
router.get('/tracks/user/:userId', getPublicTracksOfUserController);
router.get('/tracks/user', getTracksByUserController);
router.get('/tracks/joined', getJoinedTracksController);
router.get('/tracks/:id', getTrackByIdController);
router.get('/tracks/download/:trackId', downloadTrackController);
router.get('/trackswithuploader/:id', getTrackWithUploaderByIdController);
router.post('/tracks/create-track',authenticateUser, uploadTrackFields, createTrackController);
router.put('/tracks/update-track/:id', authenticateUser,uploadTrackImage, updateTrackController);
router.delete('/tracks/:id',authenticateUser, deleteTrackController);


export default router;
