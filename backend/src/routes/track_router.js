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
console.log('--->[ track_router.js] is being loaded by the application ---');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'audio') {
            cb(null, 'src/public/assets/track_mp3');
        } else if (file.fieldname === 'image') {
            cb(null, 'src/public/assets/track_image');
        } else {
            cb(new Error('Unknown field'));
        }
    },
    filename: (req, file, cb) => {
        const cleanTitle = req.body.title?.replace(/[^a-zA-Z0-9-_]/g, '_') || 'track';
        const ext = file.originalname.split('.').pop();
        cb(null, `${Date.now()}-${cleanTitle}.${ext}`);
    },
});

const upload = multer({ storage });

router.get('/tracks', getAllTracksController);
router.get('/tracks/getmytracks', authenticateUser, getMyUploadedTracksController);
router.get('/tracks/:id', getTrackByIdController);
router.get('/trackswithuploader/:id', getTrackWithUploaderByIdController);

router.post('/create-track', upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 },
]), createTrackController);
router.put('/update-track/:id', authenticateUser,updateTrackController);
router.delete('/tracks/:id',authenticateUser, deleteTrackController);

export default router;
