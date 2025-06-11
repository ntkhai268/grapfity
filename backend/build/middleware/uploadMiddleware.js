// src/middleware/uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Lấy đường dẫn thư mục gốc dự án
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.dirname(__filename)); // ../ ra khỏi /middleware

// Định nghĩa các thư mục lưu trữ
const baseUploadDir = path.join(__dirname, 'public', 'assets');
const trackImageDir = path.join(baseUploadDir, 'track_image');
const trackAudioDir = path.join(baseUploadDir, 'track_audio');
const playlistImageDir = path.join(baseUploadDir, 'playlist_image');
const userImageDir = path.join(baseUploadDir, 'user_image');

// Tạo các thư mục nếu chưa tồn tại
for (const dir of [trackImageDir, trackAudioDir, playlistImageDir, userImageDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true
    });
    console.log(`Created upload directory: ${dir}`);
  } else {
    console.log(`Upload directory already exists: ${dir}`);
  }
}

// Bộ lọc file: chỉ cho phép ảnh (dùng cho ảnh cover)
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    console.warn(`Rejected upload: Invalid image type - ${file.mimetype}`);
    cb(new Error('Chỉ chấp nhận file ảnh (jpeg, png, gif)!'), false);
  }
};

// Bộ lọc file: chỉ cho phép audio (dùng riêng nếu muốn tách)
const audioFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    console.warn(`Rejected upload: Invalid audio type - ${file.mimetype}`);
    cb(new Error('Chỉ chấp nhận file nhạc (mp3, wav, flac...)!'), false);
  }
};

// Factory tạo middleware upload ảnh
const createImageUploader = (uploadDir, prefix = 'image') => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });
  return multer({
    storage,
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 20 * 1024 * 1024
    } // 20MB
  });
};
const uploadUserImage = createImageUploader(userImageDir, 'user-avatar').single('userImage');

// Middleware upload nhiều loại file (audio + image) cho track
const uploadTrackFields = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = file.fieldname === 'audio' ? trackAudioDir : trackImageDir;
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024
  } // tối đa 100MB cho nhạc
}).fields([{
  name: 'audio',
  maxCount: 1
}, {
  name: 'image',
  maxCount: 1
}]);

// Export middleware cụ thể
const uploadPlaylistImage = createImageUploader(playlistImageDir, 'playlist-cover').single('playlistImage');
const uploadTrackImage = createImageUploader(trackImageDir, 'track-cover').single('trackImage');
export { uploadPlaylistImage, uploadTrackImage, uploadTrackFields, uploadUserImage };