// src/controllers/playlistController.js

import {
    createPlaylist,
    getAllPlaylistsByUserId,
    getAllPublicPlaylists,
    updatePlaylist,
    deletePlaylist
    // getPlaylistById
    // addTrackToPlaylist,
    // removeTrackFromPlaylist
} from '../services/playlist_service.js';

/**
 * Controller để lấy tất cả playlist của người dùng ĐÃ ĐĂNG NHẬP.
 */
const getMyPlaylistsController = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      console.error('getMyPlaylistsController Error: userId không tìm thấy trên req.');
      return res.status(401).json({ error: 'Unauthorized: Thông tin người dùng không hợp lệ.' });
    }

    console.log(`Controller: Đang lấy playlists cho user ID: ${userId}`);

    // Lấy playlist của chính chủ
    const playlists = await getAllPlaylistsByUserId(userId, userId);

    // console.log('Dữ liệu playlists trả về từ service:', playlists);

    res.status(200).json({
      message: 'Lấy danh sách playlist thành công!',
      data: playlists
    });
  } catch (error) {
    console.error(`Lỗi trong getMyPlaylistsController cho user ${req.userId || 'UNKNOWN'}:`, error);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách playlist.' });
  }
};
// lấy playlists public để hiển thị cho uer coi trong profile người khác
const getPublicPlaylistsController = async (req, res) => {
  try {
    //ko dùng thằng req.body.userId vì là dữ leiu65 từ cilent gửi lên có thể bị fake 
    //Người bị xem (chủ của profile)
    const userId = req.params.userId;
    //  Người đang đăng nhập (đang xem profile của người khác)
    const currentUserId = req.userId;

    if (!userId || isNaN(Number(userId))) {
        return res.status(400).json({ error: 'userId không hợp lệ.' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'Thiếu userId trong request.' });
    }

    const playlists = await getAllPlaylistsByUserId(userId, currentUserId);

    res.status(200).json({
      message: 'Lấy playlist công khai thành công!',
      data: playlists
    });
  } catch (error) {
    console.error('Lỗi trong getPublicPlaylistsController:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy playlist công khai.' });
  }
};

// Controller lấy tất cả các playlist public của mọi người
const getAllPublicPlaylistsController = async (req, res) => {
  try {
    const playlists = await getAllPublicPlaylists(); // GỌI service
    res.status(200).json({
      message: 'Lấy tất cả playlist public thành công!',
      data: playlists
    });
  } catch (err) {
    console.error('Lỗi khi lấy playlist public:', err);
    res.status(500).json({
      message: 'Lỗi server khi lấy playlist public.',
      error: err.message
    });
  }
};

/**
 * Controller để tạo playlist mới cho người dùng ĐÃ ĐĂNG NHẬP.
 */
const createPlaylistController = async (req, res) => {
    try {
        const userId = req.userId;
        const { trackId } = req.body; // trackId có thể là undefined
        if (!userId) {
            console.error('createPlaylistController Error: userId không tìm thấy trên req.');
            return res.status(401).json({ error: 'Unauthorized: Thông tin người dùng không hợp lệ.' });
        }
        console.log(`Controller: User ID ${userId} đang tạo playlist (trackId: ${trackId || 'không có'})`);
        const newPlaylist = await createPlaylist(userId, trackId);
        res.status(201).json(newPlaylist); // 201 Created
    } catch (error) {
        console.error(`Lỗi trong createPlaylistController cho user ${req.userId || 'UNKNOWN'}:`, error);
        if (error.statusCode === 404 && error.message === 'Không tìm thấy bài hát') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Lỗi server khi tạo playlist.' });
    }
};


/**
 * Controller để xóa một playlist.
 * Endpoint: DELETE /api/playlists/:playlistId
 */
const deletePlaylistController = async (req, res) => {
    try {
        const userId = req.userId; // Lấy userId từ middleware xác thực
        const { playlistId } = req.params; // Lấy playlistId từ tham số URL

        // --- VALIDATION ---
        if (!userId) {
            console.error('deletePlaylistController Error: userId không tìm thấy trên req.');
            return res.status(401).json({ error: 'Unauthorized: Thông tin người dùng không hợp lệ.' });
        }
        if (!playlistId || isNaN(Number(playlistId))) {
            return res.status(400).json({ error: 'Bad Request: Playlist ID không hợp lệ.' });
        }
        // ------------------

        console.log(`Controller: User ID ${userId} đang yêu cầu xóa playlist ID: ${playlistId}`);

        // --- GỌI SERVICE ĐỂ XÓA ---
        // Hàm service này cần xử lý:
        // 1. Kiểm tra playlist có tồn tại không.
        // 2. Kiểm tra người dùng có quyền xóa playlist này không (userId khớp).
        // 3. Xóa các bản ghi liên quan (ví dụ: trong PlaylistTrack).
        // 4. Xóa bản ghi Playlist.
        // 5. Ném lỗi (với statusCode) nếu không tìm thấy, không có quyền, hoặc có lỗi DB.
        await deletePlaylist(Number(playlistId), userId);
        // ---------------------------

        // --- TRẢ VỀ THÀNH CÔNG ---
        // Mã 204 No Content thường được dùng cho DELETE thành công và không cần trả về nội dung
        return res.status(204).send();
        // Hoặc nếu muốn trả về message:
        // return res.status(200).json({ message: 'Playlist đã được xóa thành công.' });
        // ---------------------------

    } catch (error) {
        // Bắt lỗi từ service
        console.error(`Lỗi trong deletePlaylistController cho user ${req.userId || 'UNKNOWN'}, playlist ${req.params.playlistId}:`, error);

        const statusCode = error.statusCode || 500;
        let errorMessage = error.message || 'Lỗi server khi xóa playlist.';

        // Xử lý các mã lỗi cụ thể từ service
        if (statusCode === 404) {
            errorMessage = 'Không tìm thấy playlist để xóa.';
        } else if (statusCode === 403) {
            errorMessage = 'Bạn không có quyền xóa playlist này.';
        } else if (statusCode === 400) {
             errorMessage = 'Dữ liệu không hợp lệ.';
        }

        return res.status(statusCode).json({ error: errorMessage });
    }
};




/**
 * Controller xử lý việc upload ảnh bìa cho playlist.
 * Chạy SAU middleware 'uploadPlaylistImage'.
 * Endpoint: POST /api/playlists/:playlistId/upload-cover
 */
const uploadPlaylistCoverController = async (req, res) => {
    
    try {
        
        // Lấy thông tin từ request (userId từ xác thực, playlistId từ URL)
        const userId = req.userId;
        const { playlistId } = req.params;
        // Lấy thông tin file đã upload từ multer
        const uploadedFile = req.file;

        // --- VALIDATION ---
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized.' });
        }
        if (!playlistId || isNaN(Number(playlistId))) {
            return res.status(400).json({ error: 'Bad Request: Playlist ID không hợp lệ.' });
        }
        // Kiểm tra xem multer có upload file thành công không
        if (!uploadedFile) {
            console.error(`uploadPlaylistCoverController Error: No file uploaded for playlist ${playlistId}. Check multer middleware.`);
            // Trả về lỗi cụ thể hơn nếu có thể (ví dụ từ req.multerError)
            const uploadError = req.multerError ? req.multerError.message : 'Không có file ảnh được tải lên hoặc file không hợp lệ.';
            return res.status(400).json({ error: `Bad Request: ${uploadError}` });
        }
        // ------------------

        console.log(`Controller: User ${userId} uploaded cover for playlist ${playlistId}. File info:`, uploadedFile);

        // --- TẠO URL CÔNG KHAI CHO FILE ĐÃ UPLOAD ---
        // Đường dẫn tương đối từ thư mục public
        const relativePath = `assets/playlist_image/${uploadedFile.filename}`;
        // Tạo URL tương đối (frontend có thể tự ghép với base URL nếu cần, hoặc backend trả URL đầy đủ)
        const imageUrl = `/${relativePath.replace(/\\/g, '/')}`; // Đảm bảo dùng dấu /

        console.log(`Controller: Generated public URL path: ${imageUrl}`);

        // --- BỎ BƯỚC CẬP NHẬT DATABASE Ở ĐÂY ---
        // Việc cập nhật imageUrl vào DB sẽ do request PUT /api/playlists/:playlistId xử lý sau
        // console.log(`Controller: Skipping DB update in upload controller.`);
        // -----------------------------------------

        // --- TRẢ VỀ URL CỦA ẢNH ĐÃ UPLOAD ---
        return res.status(200).json({
            message: 'Tải ảnh lên thành công!',
            imageUrl: imageUrl // Trả về URL mới (hoặc đường dẫn tương đối)
        });
        // -----------------------------------

    } catch (error) { // Bắt các lỗi không mong muốn khác
        console.error(`Lỗi trong uploadPlaylistCoverController cho user ${req.userId || 'UNKNOWN'}, playlist ${req.params.playlistId}:`, error);

        // Nếu có lỗi xảy ra sau khi file đã upload, xóa file đã upload để tránh rác
        if (req.file.path) {
             try {
                 fs.unlinkSync(req.file.path);
                 console.log(`Cleaned up uploaded file due to error: ${req.file.path}`);
             } catch (cleanupError) {
                 console.error("Error cleaning up uploaded file:", cleanupError);
             }
         }

        // Trả về lỗi server chung
        return res.status(500).json({ error: 'Lỗi server khi xử lý upload ảnh.' });
    }
};





/**
 * Controller để cập nhật playlist.
 */
const updatePlaylistController = async (req, res) => {
    try {
        const userId = req.userId;
        const { playlistId } = req.params;
        const { title, imageUrl, privacy } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: Yêu cầu đăng nhập.' });
        }
        if (!playlistId || isNaN(Number(playlistId))) {
            return res.status(400).json({ error: 'Bad Request: ID của playlist không hợp lệ hoặc thiếu.' });
        }
        if (typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({ error: 'Bad Request: Tiêu đề playlist không được để trống.' });
        }
        if (imageUrl !== undefined && imageUrl !== null && typeof imageUrl !== 'string') {
            return res.status(400).json({ error: 'Bad Request: Định dạng imageUrl không hợp lệ.' });
        }
        if (privacy !== undefined && privacy !== 'public' && privacy !== 'private') {
            return res.status(400).json({ error: 'Bad Request: Giá trị privacy không hợp lệ.' });
        }

        const updatedPlaylist = await updatePlaylist(
            Number(playlistId),
            userId,
            title.trim(),
            imageUrl,
            privacy
        );

        return res.status(200).json({
            message: 'Cập nhật playlist thành công!',
            data: updatedPlaylist
        });

    } catch (err) {
        const statusCode = err.statusCode || 500;
        let errorMessage = err.message || 'Lỗi server khi cập nhật playlist.';
        if (statusCode === 404) errorMessage = 'Không tìm thấy playlist.';
        else if (statusCode === 403) errorMessage = 'Bạn không có quyền cập nhật playlist này.';
        else if (statusCode === 400) errorMessage = err.message || 'Dữ liệu gửi lên không hợp lệ.';
        return res.status(statusCode).json({ error: errorMessage });
    }
};




// --- CẬP NHẬT KHỐI EXPORT Ở CUỐI FILE ---
export {
    getMyPlaylistsController,
    getPublicPlaylistsController,
    getAllPublicPlaylistsController,
    createPlaylistController,
    uploadPlaylistCoverController,
    updatePlaylistController,   
    deletePlaylistController
};
