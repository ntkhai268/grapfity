import db from '../models/index.js';
import {
    getAllTracks,
    getTrackById,
    createTrack,
    updateTrack,
    deleteTrack,
    getTrackWithUploaderById,
    getTracksByUploaderId
} from '../services/track_service.js';
import { verityJWT } from '../middleware/JWTActions.js';
import * as mm from 'music-metadata';

const getAllTracksController = async (req, res) => {
    try {
        const tracks = await getAllTracks();
        if (tracks && tracks.length > 0) {
            // Log ra đối tượng track đầu tiên để xem cấu trúc đầy đủ của nó
            // console.log("Dữ liệu thô của track đầu tiên từ service:", JSON.stringify(tracks[0], null, 2));
        }
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
        // console.log(`Controller - getTrackById - Data to be sent for track ${req.params.id}:`, JSON.stringify(track, null, 2));
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

const getMyUploadedTracksController = async (req, res) => {
    // --- THÊM LOG ĐỂ KIỂM TRA ---
    console.log('>>> getMyUploadedTracksController CALLED'); 
    // ---------------------------
    try {
        // 1. Lấy userId từ request (do middleware xác thực gắn vào)
        const userId = req.userId; // Hoặc req.user?.id

        // 2. Kiểm tra xem userId có tồn tại không
        if (!userId) {
            console.error('getMyUploadedTracksController Error: userId không tìm thấy trên req.');
            return res.status(401).json({ message: 'Unauthorized: Yêu cầu xác thực.' });
        }

        console.log(`Controller: Đang lấy các bài hát đã upload cho user ID: ${userId}`);

        // 3. Gọi hàm service để lấy tracks theo uploaderId
        const tracks = await getTracksByUploaderId(userId);

        // 4. Trả về kết quả
        return res.status(200).json({
            message: 'Lấy danh sách bài hát đã tải lên thành công!',
            data: tracks 
        });

    } catch (error) { 
        console.error(`Lỗi trong getMyUploadedTracksController cho user ${req.userId || 'UNKNOWN'}:`, error);
        if (error && error.message === "User ID không hợp lệ.") {
             return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Lỗi server khi lấy danh sách bài hát đã tải lên.' });
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
    const { id, trackUrl, imageUrl } = req.body;
    const userId = req.user?.id;
    if (!id || !trackUrl || !imageUrl) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: No user ID found' });
    }
    try {
        const updatedTrack = await updateTrack(id, { trackUrl, imageUrl, userId });
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
    const userId = req.userId;
    const trackId = req.params.id;
    console.log('🎵 trackId from URL', trackId);
    console.log('👤 req.user.id =', userId);
    
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: user not logged in' });
    }
    try{
        await deleteTrack(trackId, userId);
        return res.status(200).json({
            message: 'Delete track succeed!',
        });
    } catch (err){
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};

export {
    getAllTracksController,
    getTrackByIdController,
    getTrackWithUploaderByIdController,
    createTrackController,
    updateTrackController,
    deleteTrackController,
    getMyUploadedTracksController,

};
