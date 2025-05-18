import db from '../models/index.js';
import {
    getAllTracks,
    getTrackById,
    createTrack,
    updateTrack,
    deleteTrack,
    getTrackWithUploaderById,
    getTracksByUserId,
    getJoinedTracks,
    updateTrackStatus  
} from '../services/track_service.js';
import { verityJWT } from '../middleware/JWTActions.js';
import * as mm from 'music-metadata';

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
    console.log(req.body.audioFeatures)
    const metadata = eval('('+ req.body.audioFeatures + ')')
    console.log(metadata)
    //thêm các metadata có thể lấy tự động
    metadata.trackname = req.body.title
    metadata.release_date = req.body.releaseDate || new Date().toISOString().split('T')[0];
    metadata.year = eval(req.body.releaseDate.slice(0, 4))
    const metadataAudio = await mm.parseFile(trackUrl);
    metadata.duration_ms = Math.floor((metadataAudio.format.duration || 0) * 1000);

    console.log(trackUrl, imageUrl, uploaderId, metadata.trackname, metadata.release_date)
    if (!trackUrl || !imageUrl || !uploaderId || !metadata.trackname || !metadata.release_date) {
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
    try{
        await deleteTrack(req.params.id)
        return res.status(200).json({
            message: 'Delete track succeed!',
        });
    } catch (err){
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};

//dangkhoii them
const getTracksByUserController = async (req, res) => {
  try {
    const { jwt } = req.cookies;
    const { userId } = verityJWT(jwt);

    // 1. Lấy toàn bộ tracks kèm listeningHistories
    const tracks = await getTracksByUserId(userId);

    // 2. Chuyển về plain object và chỉ giữ listenCount + listener
    const filtered = tracks.map(track => {
      // toJSON() để có object thuần
      const t = track.toJSON();
      return {
        ...t,
        listeningHistories: (t.listeningHistories || []).map(hist => ({
        metadata: hist.metadata,
        artis: hist.track.User,
          listenCount: hist.listenCount,
          listener: hist.listener
        }))
      };
    });

    return res.status(200).json({
      message: 'Get user tracks succeed!',
      data: filtered
    });
  } catch (err) {
    console.error('Error fetching user tracks:', err);
    return res.status(500).send('Internal Server Error');
  }
};
  const updateTrackStatusController = async (req, res) => {
    // 1. Parse và validate id
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid track id' });
    }
  
    // 2. Validate status
    const { status } = req.body;
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid status' });
    }
  
    try {
      // 3. Cập nhật
      const updatedTrack = await updateTrackStatus(id, status);
  
      // 4. Trả về kết quả
      return res.status(200).json({
        message: 'Update track status succeed!',
        data: updatedTrack
      });
    } catch (err) {
      console.error('Error updating track status:', err);
      if (err.message === 'Track not found') {
        return res.status(404).json({ message: 'Track not found' });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  const getJoinedTracksController = async (req, res) => {
    try {
      const data = await getJoinedTracks();
      return res.status(200).json({
        message: 'Get joined tracks succeed!',
        data,
      });
    } catch (err) {
      console.error('Error fetching joined tracks:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
export {
    getAllTracksController,
    getTrackByIdController,
    getTrackWithUploaderByIdController,
    createTrackController,
    updateTrackController,
    deleteTrackController,
    getTracksByUserController,
    updateTrackStatusController,
    getJoinedTracksController
};
