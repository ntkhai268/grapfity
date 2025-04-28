// src/controllers/playlistController.js

import {
    createPlaylist,
    getAllPlaylistsByUserId,
    updatePlaylist,
    getPlaylistById // <-- Import service lấy playlist theo ID
} from '../services/playlist_service.js';

/**
 * Controller để lấy tất cả playlist của người dùng ĐÃ ĐĂNG NHẬP.
 * Lấy userId từ thông tin xác thực đã được middleware xử lý.
 */
const getMyPlaylistsController = async (req, res) => {
    try {
        // 1. Lấy userId từ đối tượng req (đã được middleware authenticateUser gắn vào)
        const userId = req.userId;

        // 2. Kiểm tra userId có tồn tại không (đề phòng lỗi middleware)
        if (!userId) {
            console.error('getMyPlaylistsController Error: userId không tìm thấy trên req sau khi xác thực.');
            // Trả về lỗi 401 Unauthorized
            return res.status(401).json({ error: 'Unauthorized: Thông tin người dùng không hợp lệ.' });
        }

        console.log(`Controller: Đang lấy playlists cho user ID: ${userId}`);

        // 3. Gọi service với userId lấy từ token
        const playlists = await getAllPlaylistsByUserId(userId);
        res.status(200).json(playlists);

    } catch (error) {
        // Log lỗi kèm theo userId để dễ debug hơn
        console.error(`Lỗi trong getMyPlaylistsController cho user ${req.userId || 'UNKNOWN'}:`, error);
        res.status(500).json({ error: 'Lỗi server khi lấy danh sách playlist.' });
    }
};

/**
 * Controller để tạo playlist mới cho người dùng ĐÃ ĐĂNG NHẬP.
 * Lấy userId từ thông tin xác thực, trackId (nếu có) từ body.
 */
const createPlaylistController = async (req, res) => {
    try {
        // 1. Lấy userId từ req (do middleware gắn vào)
        const userId = req.userId;
        // 2. Lấy trackId (nếu có) từ req.body
        const { trackId } = req.body;

        // 3. Kiểm tra userId
        if (!userId) {
            console.error('createPlaylistController Error: userId không tìm thấy trên req sau khi xác thực.');
            return res.status(401).json({ error: 'Unauthorized: Thông tin người dùng không hợp lệ.' });
        }

        console.log(`Controller: User ID ${userId} đang tạo playlist (trackId: ${trackId || 'không có'})`);

        // 4. Gọi service với userId từ token và trackId từ body
        const newPlaylist = await createPlaylist(userId, trackId);
        res.status(201).json(newPlaylist);

    } catch (error) {
        console.error(`Lỗi trong createPlaylistController cho user ${req.userId || 'UNKNOWN'}:`, error);
        res.status(500).json({ error: 'Lỗi server khi tạo playlist.' });
    }
};

/**
 * Controller để cập nhật playlist.
 * Lấy id (playlistId) từ URL params, title/imageUrl từ body.
 * Cần đảm bảo service có kiểm tra quyền sở hữu playlist của userId.
 */
const updatePlaylistController = async (req, res) => {
    try {
        // 1. Lấy userId từ req (do middleware gắn vào) - Để kiểm tra quyền
        const userId = req.userId;
        // 2. Lấy id của playlist cần cập nhật từ URL params (ví dụ: /api/playlists/:id)
        const { id: playlistId } = req.params; // <-- Lấy từ req.params
        // 3. Lấy title và imageUrl từ req.body
        const { title, imageUrl } = req.body;

        // 4. Kiểm tra userId và playlistId
        if (!userId) {
             console.error('updatePlaylistController Error: userId không tìm thấy trên req.');
             return res.status(401).json({ error: 'Unauthorized.' });
        }
        // Sửa: Kiểm tra playlistId có tồn tại và là số hợp lệ không
        if (!playlistId || isNaN(Number(playlistId))) {
             console.error('updatePlaylistController Error: playlistId không hợp lệ hoặc thiếu.');
             return res.status(400).json({ error: 'Bad Request: ID của playlist không hợp lệ hoặc thiếu.' });
        }

        console.log(`Controller: User ID ${userId} đang cập nhật playlist ID: ${playlistId}`);

        // 5. Gọi service updatePlaylist
        // Lưu ý: Hàm service `updatePlaylist` nên có logic kiểm tra quyền sở hữu.
        const updatedPlaylist = await updatePlaylist(Number(playlistId), title, imageUrl, userId); // Truyền userId để kiểm tra quyền

        // Kiểm tra nếu service trả về null (ví dụ: không tìm thấy playlist hoặc không có quyền)
        if (!updatedPlaylist) {
             return res.status(404).json({ message: 'Không tìm thấy playlist hoặc bạn không có quyền cập nhật.' });
        }

        return res.status(200).json({
            message: 'Cập nhật playlist thành công!',
            data: updatedPlaylist
        });

    } catch (err) {
        console.error(`Lỗi trong updatePlaylistController cho user ${req.userId || 'UNKNOWN'}, playlist ${req.params?.id}:`, err);
        res.status(500).json({ error: 'Lỗi server khi cập nhật playlist.' });
    }
};

// --- THÊM ĐỊNH NGHĨA HÀM getPlaylistByIdController ---
/**
 * Controller để lấy thông tin chi tiết một playlist theo ID.
 */
const getPlaylistByIdController = async (req, res) => {
    try {
        // Lấy playlistId từ URL params
        const { id: playlistId } = req.params;

        // Kiểm tra xem ID có hợp lệ không (ví dụ: là số)
        if (!playlistId || isNaN(Number(playlistId))) {
             return res.status(400).json({ error: 'Bad Request: ID Playlist không hợp lệ.' });
        }

        console.log(`Controller: Đang lấy chi tiết playlist ID: ${playlistId}`);

        // Gọi service để lấy dữ liệu
        const playlist = await getPlaylistById(Number(playlistId)); // Truyền ID dạng số

        // Kiểm tra kết quả từ service
        if (!playlist) {
            // Nếu service trả về null, nghĩa là không tìm thấy
            return res.status(404).json({ message: 'Không tìm thấy playlist.' });
        }

        // Trả về dữ liệu playlist nếu tìm thấy
        res.status(200).json(playlist);

    } catch (error) {
        console.error(`Lỗi trong getPlaylistByIdController cho ID ${req.params?.id}:`, error);
        res.status(500).json({ error: 'Lỗi server khi lấy chi tiết playlist.' });
    }
};


// --- SỬA LẠI KHỐI EXPORT Ở CUỐI FILE ---
export {
    getMyPlaylistsController,
    createPlaylistController,
    updatePlaylistController,
    getPlaylistByIdController // <-- Đảm bảo tên này được thêm vào đây
};
