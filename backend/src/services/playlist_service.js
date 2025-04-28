// src/services/playlist_service.js
import db from '../models/index.js'; // Đảm bảo import db đúng
import { Op } from 'sequelize'; // Import Op để dùng trong where in

/**
 * Lấy tất cả playlist của người dùng, bao gồm track và metadata (trackname).
 * Sử dụng phương pháp 2 truy vấn để tránh lỗi include lồng nhau.
 */
const getAllPlaylistsByUserId = async (userId) => {
    try {
        // --- TRUY VẤN 1: Lấy Playlists và Tracks (KHÔNG CÓ METADATA) ---
        const playlistsRaw = await db.Playlist.findAll({
            where: { userId: userId },
            include: [
                {
                    model: db.Track,
                    attributes: ['id', 'trackUrl', 'imageUrl'],
                    through: { attributes: [] },
                    include: [
                        {
                            model: db.User, // User của Track
                            attributes: ['id', 'userName']
                        }
                    ],
                },
                {
                    model: db.User, // User của Playlist
                    attributes: ['id', 'userName']
                }
            ],
            order: [['createDate', 'DESC']],
        });

        if (!playlistsRaw || playlistsRaw.length === 0) {
            return [];
        }

        const playlists = playlistsRaw.map(p => p.get({ plain: true }));

        // --- Thu thập tất cả track IDs ---
        // Sửa: Bỏ <number>
        const trackIds = new Set();
        playlists.forEach(playlist => {
            playlist.Tracks?.forEach(track => {
                if (track.id) {
                    trackIds.add(track.id);
                }
            });
        });

        // Sửa: Bỏ <number, string>
        let metadataMap = new Map();

        // --- TRUY VẤN 2: Lấy Metadata ---
        if (trackIds.size > 0) {
            const metadataResults = await db.Metadata.findAll({
                where: {
                    track_id: {
                        [Op.in]: Array.from(trackIds)
                    }
                },
                attributes: ['track_id', 'trackname'],
                raw: true
            });

            metadataResults.forEach(meta => {
                metadataMap.set(meta.track_id, meta.trackname);
            });
        }

        // --- Kết hợp dữ liệu ---
        playlists.forEach(playlist => {
            playlist.Tracks?.forEach(track => {
                track.title = metadataMap.get(track.id) || "Unknown Title";
            });
             // Đảm bảo luôn có mảng Tracks
             if (!playlist.Tracks) {
                 playlist.Tracks = [];
             }
        });

        return playlists;

    } catch (error) {
        console.error(`Error fetching playlists for user ${userId}:`, error);
        if (error.sql) {
             console.error("Failed SQL:", error.sql);
        }
        throw error;
    }
};

/**
 * Lấy thông tin chi tiết một playlist bằng ID, bao gồm tracks và metadata (trackname).
 */
const getPlaylistById = async (playlistId) => {
    const numericPlaylistId = Number(playlistId);
     if (isNaN(numericPlaylistId)) {
         console.error(`Invalid playlist ID received in getPlaylistById: ${playlistId}`);
         return null;
     }

    try {
        // --- TRUY VẤN 1: Lấy Playlist và Tracks ---
        const playlistRaw = await db.Playlist.findByPk(numericPlaylistId, {
            include: [
                {
                    model: db.Track,
                    attributes: ['id', 'trackUrl', 'imageUrl'],
                    through: { attributes: [] },
                    include: [
                        {
                            model: db.User, // User của Track
                            attributes: ['id', 'userName']
                        }
                    ]
                },
                {
                    model: db.User, // User của Playlist
                    attributes: ['id', 'userName']
                }
            ],
        });

        if (!playlistRaw) return null;

        const playlist = playlistRaw.get({ plain: true });

        // --- Thu thập track IDs ---
        // Sửa: Bỏ <number>
        const trackIds = new Set();
        playlist.Tracks?.forEach(track => {
             if (track.id) {
                 trackIds.add(track.id);
             }
        });

        // Sửa: Bỏ <number, string>
        let metadataMap = new Map();

        // --- TRUY VẤN 2: Lấy Metadata ---
        if (trackIds.size > 0) {
             const metadataResults = await db.Metadata.findAll({
                 where: {
                     track_id: {
                         [Op.in]: Array.from(trackIds)
                     }
                 },
                 attributes: ['track_id', 'trackname'],
                 raw: true
             });
             metadataResults.forEach(meta => {
                 metadataMap.set(meta.track_id, meta.trackname);
             });
        }

        // --- Kết hợp dữ liệu ---
        playlist.Tracks?.forEach(track => {
             track.title = metadataMap.get(track.id) || "Unknown Title";
        });

        if (!playlist.Tracks) {
             playlist.Tracks = [];
        }

        return playlist;

    } catch (error) {
        console.error(`Error fetching playlist with ID ${numericPlaylistId}:`, error);
         if (error.sql) {
             console.error("Failed SQL:", error.sql);
         }
        throw error;
    }
};


// --- Các hàm createPlaylist, updatePlaylist, removeTrackFromPlaylist giữ nguyên ---
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
            const track = await db.Track.findByPk(trackId, {
                 include: [{ model: db.Metadata, attributes: ['trackname'], required: false }]
            });
            if (!track) {
                const error = new Error('Không tìm thấy bài hát');
                error.statusCode = 404;
                throw error;
            }
            const trackName = track.Metadata?.trackname;
            title = `Playlist từ bài hát ${trackName || `#${track.id}`}`;
            createDate = new Date();
            imageUrl = track.imageUrl || "";
        } catch (error) {
            console.error('Error finding track for playlist creation:', error.message);
            throw error;
        }
    }

    const newPlaylist = await db.Playlist.create({ userId, title, createDate, imageUrl });

    if (trackId) {
        try {
            await db.PlaylistTrack.create({
                playlistId: newPlaylist.id,
                trackId: trackId
            });
             const playlistWithTrack = await getPlaylistById(newPlaylist.id);
             return playlistWithTrack;

        } catch (assocError) {
             console.error(`Error associating track ${trackId} with new playlist ${newPlaylist.id}:`, assocError);
             const createdPlaylistData = await getPlaylistById(newPlaylist.id);
             return createdPlaylistData;
        }
    }
     const createdPlaylistData = await getPlaylistById(newPlaylist.id);
     return createdPlaylistData;
};


const updatePlaylist = async (playlistId, title, imageUrl, userId) => {
    try {
        const numericPlaylistId = Number(playlistId);
        if (isNaN(numericPlaylistId)) {
             throw new Error("Playlist ID không hợp lệ.");
        }
        const playlist = await db.Playlist.findByPk(numericPlaylistId);
        if (!playlist) return null;
        if (playlist.userId !== userId) {
            console.warn(`User ${userId} attempted to update playlist ${numericPlaylistId} owned by user ${playlist.userId}`);
            return null;
        }
        await playlist.update({ title, imageUrl });
        const updatedPlaylistData = await getPlaylistById(numericPlaylistId);
        return updatedPlaylistData;

    } catch (error) {
         console.error(`Error updating playlist ${playlistId}:`, error);
         throw error;
    }
};


const removeTrackFromPlaylist = async (playlistId, trackId, userId) => {
    try {
        const numericPlaylistId = Number(playlistId);
        const numericTrackId = Number(trackId);
        if (isNaN(numericPlaylistId) || isNaN(numericTrackId)) {
             throw new Error("Playlist ID hoặc Track ID không hợp lệ.");
        }
        const playlist = await db.Playlist.findOne({
             where: { id: numericPlaylistId, userId: userId }
        });
        if (!playlist) {
             return { success: false, message: "Không tìm thấy playlist hoặc bạn không có quyền." };
        }
        const result = await db.PlaylistTrack.destroy({
             where: {
                 playlistId: numericPlaylistId,
                 trackId: numericTrackId
             }
        });
        if (result > 0) {
             return { success: true, message: "Đã xóa bài hát khỏi playlist." };
        } else {
             return { success: false, message: "Không tìm thấy bài hát này trong playlist." };
        }
    } catch (error) {
         console.error(`Error removing track ${trackId} from playlist ${playlistId}:`, error);
         throw error;
    }
};


// --- ĐẢM BẢO EXPORT ĐẦY ĐỦ ---
export {
    getAllPlaylistsByUserId,
    createPlaylist,
    updatePlaylist,
    getPlaylistById,
    removeTrackFromPlaylist
};
