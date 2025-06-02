import db from '../models/index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { verityJWT } from '../middleware/JWTActions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import {
    getAllTracks,
    getTrackById,
    getTrackWithUploaderById,
    getTracksByUploaderId,
    createTrack,
    updateTrack,
    deleteTrack,
    getAllTracksForAdmin,
    getTracksByUserId,
    getJoinedTracks,
    updateTrackStatus
} from '../services/track_service.js';


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
    const jwtData = verityJWT(req.cookies.jwt);
    const uploaderId = jwtData.userId;

    const imageUrl = `assets/track_image/${req.files.image[0].filename}`;
    const trackUrl = `assets/track_audio/${req.files.audio[0].filename}`;
    const absAudioPath = path.resolve(`src/public/${trackUrl}`);
    const privacy = req.body.privacy || 'public';
    const trackname = req.body.title || 'Untitled';

    const newTrack = await createTrack({
      trackUrl,
      imageUrl,
      uploaderId,
      privacy,
      absAudioPath,
      trackname
    });

    return res.status(200).json({
      message: 'Create track succeed!',
      data: newTrack
    });
  } catch (err) {
    console.error('Track creation failed:', err);
    return res.status(500).json({ message: err.message || 'Internal Server Error' });
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
        });
    } catch (err){
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};

const getJoinedTracksController = async (req, res) => {
  try {
    const data = await getJoinedTracks();
    // Loại bỏ trường 'track' trong từng listeningHistories nếu có
    const cleaned = data.map(t => {
      const tJSON = t.toJSON();
      if (Array.isArray(tJSON.listeningHistories)) {
        tJSON.listeningHistories = tJSON.listeningHistories.map(hist => {
          const { track, ...rest } = hist; // xoá trường 'track'
          return rest;
        });
      }
      return tJSON;
    });

    return res.status(200).json({
      message: 'Get joined tracks succeed!',
      data: cleaned,
    });
  } catch (err) {
    console.error('Error fetching joined tracks:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

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

export {
    getAllTracksController,
    getTrackByIdController,
    getTrackWithUploaderByIdController,
    uploadTrackCoverController,
    createTrackController,
    updateTrackController,
    deleteTrackController,
    getMyTracksController ,
    getPublicTracksOfUserController,
    getJoinedTracksController,
    downloadTrackController,
    updateTrackStatusController,
    getTracksByUserController
};
