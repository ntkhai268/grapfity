import {
    createPlaylist,
    getAllPlaylistsByUserId,
    updatePlaylist
} from '../services/playlist_service.js';

const getAllPlaylistsByUserIdController = async (req, res) => {
    const { userId } = req.body;
    try {
        const playlists = await getAllPlaylistsByUserId(userId);
        res.status(200).json(playlists);
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createPlaylistController = async (req, res) => {
    const { userId, trackId } = req.body;
    try {
        const playlist = await createPlaylist(userId, trackId);
        res.status(201).json(playlist);
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updatePlaylistController = async (req, res) => {
    const { id, title, imageUrl } = req.body;
    try {
        const updatedPlaylist = await updatePlaylist(id, title, imageUrl);
        return res.status(200).json({
            message: 'Update track succeed!',
            data: updatedPlaylist
        });
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};

// ✅ Export theo chuẩn ES module
export {
    getAllPlaylistsByUserIdController,
    createPlaylistController,
    updatePlaylistController
};
