import db from '../models/index.js';
import {
    getAllTracks,
    getTrackById,
    createTrack,
    updateTrack,
    deleteTrack,
    getTrackWithUploaderById
} from '../services/track_service.js';
import { verityJWT } from '../middleware/JWTActions.js';

const getAllTracksController = async (req, res) => {
    try {
        const tracks = await getAllTracks();
        return res.status(200).json({
            message: 'Get all tracks succeed!',
            data: tracks
        });
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};

const getTrackByIdController = async (req, res) => {
    try {
        const track = await getTrackById(req.params.id);
        if (!track) {
            return res.status(404).json({ message: 'Track not found' });
        }
        return res.status(200).json({
            message: 'Get track succeed!',
            data: track
        });
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};

const getTrackWithUploaderByIdController = async (req, res) => {
    try {
        const track = await getTrackWithUploaderById(req.params.id);
        if (!track) {
            return res.status(404).json({ message: 'Track not found' });
        }
        return res.status(200).json({
            message: 'Get track succeed!',
            data: track
        });
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};

const createTrackController = async (req, res) => {
    const JWT = req.cookies;
    const data = verityJWT(JWT.jwt);
    const uploaderId = data.userId;
    const trackUrl = req.files.audio[0].destination + '/' + req.files.audio[0].filename
    const imageUrl = req.files.image[0].destination + '/' + req.files.image[0].filename
    const metadata = eval(req.body.metadata)
    metadata.trackname = req.body.title
    metadata.release_date = req.body.releaseDate || new Date().toISOString().split('T')[0];
    metadata.year = eval(req.body.releaseDate.slice(0, 4))

    console.log(trackUrl, imageUrl)
    if (!trackUrl || !imageUrl || !uploaderId || !metadata.trackname || metadata.release_date) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        const newTrack = await createTrack(trackUrl, imageUrl, uploaderId, metadata);
        return res.status(200).json({
            message: 'Create track succeed!',
            data: newTrack
        });
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};

const updateTrackController = async (req, res) => {
    const { id, trackUrl, imageUrl, uploaderId } = req.body;
    if (!id || !trackUrl || !imageUrl || !uploaderId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        const updatedTrack = await updateTrack(id, { trackUrl, imageUrl, uploaderId });
        return res.status(200).json({
            message: 'Update track succeed!',
            data: updatedTrack
        });
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};

const deleteTrackController = async (req, res) => {
    // TODO: Implement logic if needed
};

export {
    getAllTracksController,
    getTrackByIdController,
    getTrackWithUploaderByIdController,
    createTrackController,
    updateTrackController,
    deleteTrackController
};
