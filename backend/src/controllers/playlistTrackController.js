import {
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    getTracksInPlaylist
} from '../services/playlist_track_service.js';

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

const getTracksInPlaylistController = async (req, res) => {
    const { playlistId } = req.params;

    try {
        const tracks = await getTracksInPlaylist(playlistId);
        res.status(200).json({
            data: tracks
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// ✅ Xuất theo chuẩn ES module
export {
    addTrackToPlaylistController,
    removeTrackFromPlaylistController,
    getTracksInPlaylistController
};
