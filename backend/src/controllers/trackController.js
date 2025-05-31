import db from '../models/index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import {
    getTracksById,
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

// danh cho chính chủ, có thể xem cả public và private trong chính profile của mình
const getMyTracksController  = async (req, res) => {
    // --- THÊM LOG ĐỂ KIỂM TRA ---
    console.log('>>> getMyUploadedTracksController CALLED'); 
    // ---------------------------
    try {
        // 1. Lấy userId từ request (do middleware xác thực gắn vào)
        const userId = req.userId; 

        // 2. Kiểm tra xem userId có tồn tại không
        if (!userId) {
            console.error('getMyUploadedTracksController Error: userId không tìm thấy trên req.');
            return res.status(401).json({ message: 'Unauthorized: Yêu cầu xác thực.' });
        }

        console.log(`Controller: Đang lấy các bài hát đã upload cho user ID: ${userId}`);

        // 3. Gọi hàm service để lấy tracks theo uploaderId
        const tracks = await getTracksByUploaderId(userId, userId);

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


// danh để xem profile người khác
const getPublicTracksOfUserController = async (req, res) => {
  console.log('>>> getPublicTracksOfUserController CALLED');

  try {
    // Chủ sở hữu tracks (bị xem)
    const userId = req.params.userId;

    // Người đang xem profile (khách)
    const currentUserId = req.userId;

    if (!userId || isNaN(Number(userId))) {
      return res.status(400).json({ message: 'userId không hợp lệ trong URL.' });
    }

    // Dùng chung service giống Playlist: userId (chủ), currentUserId (người xem)
    const tracks = await getTracksByUploaderId(userId, currentUserId);

    return res.status(200).json({
      message: 'Lấy danh sách bài hát công khai của người dùng thành công!',
      data: tracks
    });

  } catch (error) {
    console.error('Lỗi trong getPublicTracksOfUserController:', error);
    if (error?.message === "User ID không hợp lệ.") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Lỗi server khi lấy danh sách bài hát công khai.' });
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
    try {
        const JWT = req.cookies;
        const data = verityJWT(JWT.jwt);
        const uploaderId = data.userId;
        const imageUrl = `assets/track_image/${req.files.image[0].filename}`;
        const trackUrl = `assets/track_audio/${req.files.audio[0].filename}`;
        const privacy = req.body.privacy || 'public';

        // === Tạo object metadata trực tiếp từ req.body ===
        const metadata = {
            trackname: req.body.title,
            track_id: null, // Để hệ thống tự tạo (autoincrement)
            release_date: req.body.releaseDate || new Date().toISOString().split('T')[0],
            createdAt: new Date(),
            updatedAt: new Date(),
            lyrics: req.body.lyrics || '',

            // Nếu FE truyền thêm trường nào nữa (key, energy, danceability, v.v.) thì gán thêm ở đây.
            // key: req.body.key,
            // danceability: req.body.danceability,
            // v.v.
        };

        const newTrack = await createTrack(trackUrl, imageUrl, uploaderId, privacy, metadata);
        return res.status(200).json({
            message: 'Create track succeed!',
            data: newTrack,
            track_file_name: req.files.audio[0].filename,
            track_id: newTrack.id

        });
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
};


const updateTrackController = async (req, res) => {
  const id = req.params.id; // ID nằm trong URL
  const { title, lyrics } = req.body;
   const userId = req.userId;
 

  if (!id || !userId) {
    return res.status(400).json({ message: 'Thiếu ID hoặc chưa đăng nhập.' });
  }

  try {
    const updateData = {};

    if (title) updateData.title = title;
    if (lyrics !== undefined) updateData.lyrics = lyrics;
    if (req.body.privacy) updateData.privacy = req.body.privacy;

    // ✅ Nhận file nếu có
    if (req.file) {
     updateData.imageUrl = '/assets/track_image/' + req.file.filename;
    }
    console.log("📥 Uploaded file:", req.file);

    
   
    const updatedTrack = await updateTrack(id, updateData, userId);
    

    if (title || lyrics !== undefined) {
      const metadataUpdate = {};
      if (title) metadataUpdate.trackname = title;
      if (lyrics !== undefined) metadataUpdate.lyrics = lyrics;

      await db.Metadata.update(
        metadataUpdate,
        { where: { track_id: id } }
      );
    }
    

    return res.status(200).json({
      message: 'Update track succeed!',
      data: updatedTrack
    });
  } catch (err) {
    console.error('❌ Failed to update track:', err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
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
            track_id: trackId,
        });
    } catch (err){
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};

const downloadTrackController = async (req, res) => {
  try {
    const trackId = req.params.trackId;
    const track = await getTrackById(trackId);

    if (!track.trackUrl) {
      return res.status(404).json({ error: 'Không có đường dẫn âm thanh.' });
    }

    const filePath = path.join(__dirname, '..', 'public', track.trackUrl.replace(/^\/?/, ''));

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File không tồn tại trên server.' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="track-${trackId}${path.extname(filePath)}"`);
    return res.download(filePath);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Không thể tải bài hát.' });
  }
};


const getTracksByIdController = async (req, res) => {
    try {
        const trackIds = req.body.track_ids;
        
        if (!trackIds || !Array.isArray(trackIds)) {
            return res.status(400).json({ error: 'Invalid track IDs' });
        }

        const tracks = await getTracksById(trackIds);
        return res.status(200).json(tracks);
    } catch (error) {
        console.error('Error in getTracksByIdController:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export {
    getTracksByIdController,
    getAllTracksController,
    getTrackByIdController,
    getTrackWithUploaderByIdController,
    uploadTrackCoverController,
    createTrackController,
    updateTrackController,
    deleteTrackController,
    getMyTracksController ,
    getPublicTracksOfUserController,
    downloadTrackController

};
