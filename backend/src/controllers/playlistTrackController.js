import {
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    getTracksInPlaylist
} from '../services/playlist_track_service.js';

const addTrackToPlaylistController = async (req, res) => {
    const { playlistId } = req.params;
    const { trackId } = req.body;

    try {
        const result = await addTrackToPlaylist(playlistId, trackId);
        res.status(200).json({
            message: 'Đã thêm bài hát',
            data: result
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const removeTrackFromPlaylistController = async (req, res) => {
    const { playlistId } = req.params;
    const { trackId } = req.body;

    try {
        const deleted = await removeTrackFromPlaylist(playlistId, trackId);
        res.status(200).json({
            message: 'Xóa thành công',
            data: deleted
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
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
