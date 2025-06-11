// src/controllers/uploadImageController.js
import path from 'path'; // Module path của Node.js để xử lý đường dẫn file
import fs from 'fs'; // Module file system để kiểm tra thư mục
import { fileURLToPath } from 'url'; // Để lấy đường dẫn thư mục hiện tại trong ES Modules

// --- Xác định đường dẫn gốc của dự án và thư mục uploads ---
// Lấy đường dẫn thư mục hiện tại (__dirname trong CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Đường dẫn đến thư mục lưu ảnh playlist (ví dụ: backend/public/uploads/playlists)
// Đi từ thư mục controllers lên 2 cấp -> vào public -> uploads -> playlists
const uploadDir = path.resolve(__dirname, '../../public/uploads/playlists');
// -----------------------------------------------------------

// --- Đảm bảo thư mục uploads tồn tại ---
if (!fs.existsSync(uploadDir)) {
  // Tạo thư mục nếu chưa có, bao gồm cả thư mục cha (recursive: true)
  fs.mkdirSync(uploadDir, {
    recursive: true
  });
  console.log(`Created directory: ${uploadDir}`);
}
// --------------------------------------

/**
 * Controller xử lý upload ảnh bìa playlist.
 * Middleware multer đã xử lý file và lưu vào req.file.
 */
const uploadPlaylistImageController = async (req, res) => {
  try {
    // Kiểm tra xem middleware multer có gửi file lên không và lưu thành công không
    if (!req.file) {
      console.error('Upload Controller: Không tìm thấy req.file. Middleware multer có thể chưa chạy đúng hoặc có lỗi.');
      // Lỗi này thường do cấu hình multer hoặc key trong FormData sai
      return res.status(400).json({
        error: 'Không có file ảnh nào được tải lên hoặc có lỗi xử lý file.'
      });
    }

    // --- Tạo URL đầy đủ để trả về cho frontend ---
    // req.file.filename là tên file mà multer đã lưu (ví dụ: playlist-1007-1745...)

    // Lấy protocol và host từ request (ví dụ: http://localhost:8080)
    const protocol = req.protocol;
    const host = req.get('host');

    // Tạo phần đường dẫn công khai (phải khớp với cấu hình express.static)
    // Ví dụ: Nếu app.use('/uploads', express.static('public/uploads'))
    // thì đường dẫn công khai là '/uploads/playlists/ten_file.ext'
    const publicPath = `/uploads/playlists/${req.file.filename}`;

    // Tạo URL đầy đủ
    const imageUrl = `${protocol}://${host}${publicPath}`;
    console.log(`Upload Controller: File uploaded successfully. Path: ${req.file.path}, URL: ${imageUrl}`);

    // Trả về URL của ảnh đã upload
    res.status(200).json({
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Lỗi trong quá trình xử lý upload ảnh:', error);
    res.status(500).json({
      error: 'Lỗi server khi tải ảnh lên.'
    });
  }
};
export { uploadPlaylistImageController };