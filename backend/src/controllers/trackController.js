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
// 
// controller để tải ảnh cover cho tracks
const uploadTrackCoverController = async (req, res) => {
    try {
        const userId = req.userId;
        const { trackId } = req.params;
        const uploadedFile = req.file;

        // --- VALIDATION ---
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: Yêu cầu đăng nhập.' });
        }
        if (!trackId || isNaN(Number(trackId))) {
            return res.status(400).json({ error: 'Bad Request: Track ID không hợp lệ.' });
        }
        if (!uploadedFile) {
            const uploadError = req.multerError?.message || 'Không có file ảnh được tải lên hoặc file không hợp lệ.';
            return res.status(400).json({ error: `Bad Request: ${uploadError}` });
        }

        // --- TẠO URL TƯƠNG ĐỐI ---
        const relativePath = `assets/track_image/${uploadedFile.filename}`;
        const imageUrl = `/${relativePath.replace(/\\/g, '/')}`; // hỗ trợ Windows path

        console.log(`User ${userId} uploaded cover for track ${trackId}: ${imageUrl}`);

        // --- TRẢ VỀ URL ẢNH ---
        return res.status(200).json({
            message: 'Tải ảnh track thành công!',
            imageUrl: imageUrl
        });

    } catch (error) {
        console.error(`Lỗi trong uploadTrackCoverController:`, error);

        // Nếu có lỗi và đã upload file, thì xóa file tránh rác
        if (req.file?.path) {
            try {
                fs.unlinkSync(req.file.path);
                console.log(`Đã xoá file lỗi: ${req.file.path}`);
            } catch (cleanupError) {
                console.error("Lỗi khi xoá file:", cleanupError);
            }
        }

        return res.status(500).json({ error: 'Lỗi server khi upload ảnh track.' });
    }
};

const createTrackController = async (req, res) => {
    const JWT = req.cookies;
    const data = verityJWT(JWT.jwt);
    const uploaderId = data.userId;
    const imageUrl = `assets/track_image/${req.files.image[0].filename}`;
    const trackUrl = `assets/track_audio/${req.files.audio[0].filename}`;
    console.log(req.body.audioFeatures)
    const metadata = JSON.parse(req.body.audioFeatures);
    console.log('>>> Metadata sau parse:', metadata); 
    

    const metadataAudio = await mm.parseFile(req.files.audio[0].path);
    //thêm các metadata có thể lấy tự động
    metadata.trackname = req.body.title
    metadata.track_id = null; // Hệ thống tự tạo (identity/autoincrement), KHÔNG nên gán

    metadata.explicit = req.body.explicit === 'true' || false;
    metadata.danceability = parseFloat(req.body.danceability) || 0;
    metadata.energy = parseFloat(req.body.energy) || 0;
    metadata.key = parseInt(req.body.key) || 0;
    metadata.loudness = parseFloat(req.body.loudness) || 0;
    metadata.mode = parseInt(req.body.mode) || 0;
    metadata.speechiness = parseFloat(req.body.speechiness) || 0;
    metadata.acousticness = parseFloat(req.body.acousticness) || 0;
    metadata.instrumentalness = parseFloat(req.body.instrumentalness) || 0;
    metadata.liveness = parseFloat(req.body.liveness) || 0;
    metadata.valence = parseFloat(req.body.valence) || 0;
    metadata.tempo = parseFloat(req.body.tempo) || 0;
    metadata.duration_ms = Math.floor((metadataAudio.format.duration || 0) * 1000); // giữ nguyên như trước
    metadata.time_signature = parseInt(req.body.time_signature) || 4;
    metadata.year = parseInt(req.body.releaseDate?.slice(0, 4)) || new Date().getFullYear();
    metadata.release_date = req.body.releaseDate || new Date().toISOString().split('T')[0];
    metadata.createdAt = new Date();
    metadata.updatedAt = new Date();
    metadata.lyrics =metadata.lyrics || '';

   
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
    uploadTrackCoverController,
    createTrackController,
    updateTrackController,
    deleteTrackController,
    getMyUploadedTracksController,

};
