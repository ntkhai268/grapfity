import db from '../models/index.js';

const getAllPlaylistsByUserId = async (userId) => {
    try {
        const playlists = await db.Playlist.findAll({
            where: { userId: userId },
            include: [
                {
                    model: db.Track,
                    through: { attributes: [] }, // Không lấy thuộc tính của bảng trung gian
                },
            ],
        });
        return playlists;
    } catch (error) {
        console.error('Error fetching playlists:', error);
        throw error;
    }
};

const createPlaylist = async (userId, trackId) => {
    let title, createDate, imageUrl;
    const playlistCount = await db.Playlist.count({
        where: { userId: userId }
    });

    if (!trackId) {
        title = "Danh sách phát của tôi #" + (playlistCount + 1);
        createDate = new Date();
        imageUrl = "";
    } else {
        try {
            const track = await db.Track.findByPk(trackId);
            if (!track) {
                throw new Error('Không tìm thấy bài hát');
            }

            title = `Playlist từ bài hát #${track.id}`;
            createDate = new Date();
            imageUrl = track.imageUrl || "";
        } catch (error) {
            console.error('Error creating playlist:', error.message);
            throw error;
        }
    }

    const newPlaylist = await db.Playlist.create({ userId, title, createDate, imageUrl });

    if (trackId) {
        console.log(">>playlistId: ", newPlaylist.id);
        console.log(">>trackId: ", trackId);
        await db.PlaylistTrack.create({
            playlistId: newPlaylist.id,
            trackId: trackId
        });
    }

    return newPlaylist;
};

const updatePlaylist = async (id, title, imageUrl) => {
    const playlist = await db.Playlist.findByPk(id);
    await playlist.update({ title, imageUrl });
    return playlist;
};

const deleteTrack = async (id) => {
    const playlist = await db.Playlist.findByPk(id);
    // Logic chưa được implement
};

// ✅ Export theo chuẩn ES module
export {
    getAllPlaylistsByUserId,
    createPlaylist,
    updatePlaylist
};
