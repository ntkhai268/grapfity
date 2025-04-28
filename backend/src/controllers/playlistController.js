// src/controllers/playlistController.js

import {
    createPlaylist,
    getAllPlaylistsByUserId,
    updatePlaylist,
    getPlaylistById,
    addTrackToPlaylist,
    removeTrackFromPlaylist // <<< Đảm bảo service này đã được import
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
        const playlists = await getAllPlaylistsByUserId(userId);
        res.status(200).json(playlists);
    } catch (error) {
        console.error(`Lỗi trong getMyPlaylistsController cho user ${req.userId || 'UNKNOWN'}:`, error);
        res.status(500).json({ error: 'Lỗi server khi lấy danh sách playlist.' });
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
 * Controller để cập nhật playlist.
 */
const updatePlaylistController = async (req, res) => {
    try {
        const userId = req.userId;
        const { playlistId } = req.params;
        const { title, imageUrl } = req.body;

        if (!userId) {
             console.error('updatePlaylistController Error: userId không tìm thấy trên req.');
             return res.status(401).json({ error: 'Unauthorized.' });
        }
        if (!playlistId || isNaN(Number(playlistId))) {
             console.error('updatePlaylistController Error: playlistId không hợp lệ hoặc thiếu.');
             return res.status(400).json({ error: 'Bad Request: ID của playlist không hợp lệ hoặc thiếu.' });
        }

        console.log(`Controller: User ID ${userId} đang cập nhật playlist ID: ${playlistId}`);
        const updatedPlaylist = await updatePlaylist(Number(playlistId), title, imageUrl, userId);

        return res.status(200).json({
            message: 'Cập nhật playlist thành công!',
            data: updatedPlaylist
        });

    } catch (err) {
        console.error(`Lỗi trong updatePlaylistController cho user ${req.userId || 'UNKNOWN'}, playlist ${req.params?.playlistId}:`, err);
        if (err.statusCode === 404) {
            return res.status(404).json({ error: 'Không tìm thấy playlist.' });
        }
        if (err.statusCode === 403) {
             return res.status(403).json({ error: 'Bạn không có quyền cập nhật playlist này.' });
        }
        res.status(500).json({ error: 'Lỗi server khi cập nhật playlist.' });
    }
};

/**
 * Controller để lấy thông tin chi tiết một playlist theo ID.
 */
const getPlaylistByIdController = async (req, res) => {
    try {
        const { playlistId } = req.params;
        if (!playlistId || isNaN(Number(playlistId))) {
             return res.status(400).json({ error: 'Bad Request: ID Playlist không hợp lệ.' });
        }
        console.log(`Controller: Đang lấy chi tiết playlist ID: ${playlistId}`);
        const playlist = await getPlaylistById(Number(playlistId));
        if (!playlist) {
             return res.status(404).json({ message: 'Không tìm thấy playlist.' });
        }
        res.status(200).json(playlist);
    } catch (error) {
        console.error(`Lỗi trong getPlaylistByIdController cho ID ${req.params?.playlistId}:`, error);
        if (error.message === "Playlist ID không hợp lệ.") {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Lỗi server khi lấy chi tiết playlist.' });
    }
};

/**
 * Controller để thêm track vào playlist hiện có.
 */
const addTrackToPlaylistController = async (req, res) => {
    try {
        const userId = req.userId;
        const { playlistId } = req.params;
        const { trackId } = req.body;

        if (!userId) {
           return res.status(401).json({ error: 'Unauthorized: Yêu cầu đăng nhập.' });
        }
        if (!playlistId || isNaN(Number(playlistId))) {
           return res.status(400).json({ error: 'Bad Request: Playlist ID không hợp lệ.' });
        }
        if (!trackId || isNaN(Number(trackId))) {
           return res.status(400).json({ error: 'Bad Request: Track ID không hợp lệ hoặc thiếu.' });
        }

        console.log(`Controller: User ${userId} thêm track ${trackId} vào playlist ${playlistId}`);
        const newPlaylistTrack = await addTrackToPlaylist(Number(playlistId), Number(trackId), userId);

        return res.status(200).json({
            message: 'Đã thêm bài hát vào playlist thành công!',
            data: newPlaylistTrack
        });

    } catch (error) {
        console.error(`Lỗi trong addTrackToPlaylistController cho user ${req.userId}, playlist ${req.params?.playlistId}, track ${req.body?.trackId}:`, error.message);
        if (error.message === 'Playlist not found') {
             return res.status(404).json({ error: 'Không tìm thấy playlist được chỉ định.' });
        }
        if (error.message === 'Track not found') {
             return res.status(404).json({ error: 'Không tìm thấy bài hát được chỉ định.' });
        }
        if (error.message === 'Permission denied') {
              return res.status(403).json({ error: 'Bạn không có quyền thêm vào playlist này.' });
        }
        if (error.message === 'Track already exists in playlist') {
             return res.status(409).json({ error: 'Bài hát này đã có trong playlist.' });
        }
        res.status(500).json({ error: 'Lỗi server khi thêm track vào playlist.' });
    }
};


// =====================================================
// === CONTROLLER MỚI ĐỂ XÓA TRACK KHỎI PLAYLIST ===
// =====================================================
/**
 * Controller để xóa track khỏi playlist.
 * Endpoint: DELETE /api/playlists/:playlistId/tracks/:trackId
 */
const removeTrackFromPlaylistController = async (req, res) => {
    try {
        // 1. Lấy userId (từ middleware)
        const userId = req.userId;
        // 2. Lấy playlistId và trackId từ URL params
        const { playlistId, trackId } = req.params;

        // 3. Validate inputs
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: Yêu cầu đăng nhập.' });
        }
        if (!playlistId || isNaN(Number(playlistId))) {
            return res.status(400).json({ error: 'Bad Request: Playlist ID không hợp lệ.' });
        }
        if (!trackId || isNaN(Number(trackId))) {
            return res.status(400).json({ error: 'Bad Request: Track ID không hợp lệ.' });
        }

        console.log(`Controller: User ${userId} xóa track ${trackId} khỏi playlist ${playlistId}`);

        // 4. Gọi service function
        // Service sẽ ném lỗi nếu không tìm thấy playlist/track hoặc không có quyền
        const result = await removeTrackFromPlaylist(Number(playlistId), Number(trackId), userId);

        // 5. Nếu thành công (service trả về { success: true, ... })
        // Service hiện tại trả về object, nhưng chúng ta đã sửa service để throw error
        // Nên nếu không có lỗi nào được throw, nghĩa là thành công
        return res.status(200).json({
            message: result.message || 'Đã xóa bài hát khỏi playlist thành công!'
            // Hoặc trả về 204 No Content nếu không cần message
            // return res.status(204).send();
        });

    } catch (error) {
        // 6. Bắt lỗi từ service và trả về status code phù hợp
        console.error(`Lỗi trong removeTrackFromPlaylistController cho user ${req.userId}, playlist ${req.params?.playlistId}, track ${req.params?.trackId}:`, error.message);

        if (error.message === 'Playlist not found') {
            return res.status(404).json({ error: 'Không tìm thấy playlist được chỉ định.' });
        }
        if (error.message === 'Track not found in playlist') {
             return res.status(404).json({ error: 'Không tìm thấy bài hát này trong playlist.' });
        }
        if (error.message === 'Permission denied') {
             return res.status(403).json({ error: 'Bạn không có quyền xóa khỏi playlist này.' });
        }
        // Lỗi chung khác
        res.status(500).json({ error: 'Lỗi server khi xóa track khỏi playlist.' });
    }
};


// --- CẬP NHẬT KHỐI EXPORT Ở CUỐI FILE ---
export {
    getMyPlaylistsController,
    createPlaylistController,
    updatePlaylistController,
    getPlaylistByIdController,
    addTrackToPlaylistController,
    removeTrackFromPlaylistController // <<< Thêm controller xóa track
    // Thêm deletePlaylistController nếu bạn có định nghĩa nó
};
