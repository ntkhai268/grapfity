// src/services/playlist_track_service.js
import db from '../models/index.js'; // Đảm bảo import db đúng
import { Op } from 'sequelize'; // Import Op để dùng trong where in

// --- HÀM KIỂM TRA QUYỀN SỞ HỮU PLAYLIST (Tiện ích nội bộ) ---
const checkPlaylistOwnership = async (playlistId, userId) => {
    const playlist = await db.Playlist.findOne({
        where: { id: playlistId, userId: userId }
    });
    if (!playlist) {
        // Phân biệt không tìm thấy và không có quyền
        const existingPlaylist = await db.Playlist.findByPk(playlistId);
        if (!existingPlaylist) {
            const error = new Error('Playlist not found');
            error.statusCode = 404;
            throw error;
        } else {
            const error = new Error('Permission denied');
            error.statusCode = 403;
            throw error;
        }
    }
    return playlist; // Trả về playlist nếu hợp lệ
};


// =============================================
// === HÀM THÊM TRACK VÀO PLAYLIST ===
// =============================================
/**
 * Thêm một Track vào một Playlist.
 * @param {number} playlistId ID của Playlist cần thêm vào.
 * @param {number} trackId ID của Track cần thêm.
 * @param {number} userId ID của người dùng thực hiện (để kiểm tra quyền).
 * @returns {Promise<object>} Bản ghi PlaylistTrack vừa được tạo.
 * @throws {Error} Nếu Playlist/Track không tồn tại, không có quyền, hoặc Track đã tồn tại.
 */
const addTrackToPlaylist = async (playlistId, trackId, userId) => {
    // 1. Validate Inputs (Controller cũng đã làm, nhưng kiểm tra lại)
    const numericPlaylistId = Number(playlistId);
    const numericTrackId = Number(trackId);
    if (isNaN(numericPlaylistId) || isNaN(numericTrackId) || !userId) {
        const error = new Error("Dữ liệu đầu vào không hợp lệ (playlistId, trackId, userId).");
        error.statusCode = 400;
        throw error;
    }

    try {
        // 2. Kiểm tra Playlist và quyền sở hữu
        await checkPlaylistOwnership(numericPlaylistId, userId); // Ném lỗi nếu không hợp lệ

        // 3. Kiểm tra Track có tồn tại không
        const track = await db.Track.findByPk(numericTrackId);
        if (!track) {
            const error = new Error('Track not found');
            error.statusCode = 404;
            throw error;
        }

        // 4. Kiểm tra xem Track đã có trong Playlist chưa và Tạo liên kết
        const [playlistTrack, created] = await db.PlaylistTrack.findOrCreate({
            where: {
                playlistId: numericPlaylistId,
                trackId: numericTrackId
            },
            defaults: {
                playlistId: numericPlaylistId,
                trackId: numericTrackId
            }
        });

        // 5. Xử lý kết quả
        if (created) {
            console.log(`Service: Track ${numericTrackId} added to playlist ${numericPlaylistId}`);
            return playlistTrack; // Trả về bản ghi mới tạo
        } else {
            console.warn(`Service: Track ${numericTrackId} already exists in playlist ${numericPlaylistId}`);
            const error = new Error('Bài hát đã có trong playlist');
            error.statusCode = 409; // Conflict
            throw error;
        }

    } catch (error) {
        console.error(`Error adding track ${trackId} to playlist ${playlistId} for user ${userId}:`, error);
        // Gán statusCode mặc định nếu chưa có
        if (!error.statusCode) {
             error.statusCode = 500;
        }
        throw error; // Ném lại lỗi để controller xử lý
    }
};

// =============================================
// === HÀM XÓA TRACK KHỎI PLAYLIST ===
// =============================================
/**
 * Xóa một Track khỏi một Playlist.
 * @param {number} playlistId ID của Playlist chứa Track.
 * @param {number} trackId ID của Track cần xóa.
 * @param {number} userId ID của người dùng thực hiện (để kiểm tra quyền).
 * @returns {Promise<{ success: boolean; message: string }>} Kết quả xóa.
 * @throws {Error} Nếu Playlist/Track không tồn tại hoặc không có quyền.
 */
const removeTrackFromPlaylist = async (playlistId, trackId, userId) => {
    // 1. Validate Inputs
    const numericPlaylistId = Number(playlistId);
    const numericTrackId = Number(trackId);
    if (isNaN(numericPlaylistId) || isNaN(numericTrackId) || !userId) {
        const error = new Error("Playlist ID hoặc Track ID không hợp lệ.");
        error.statusCode = 400;
        throw error;
    }

    try {
        // 2. Kiểm tra Playlist và quyền sở hữu
        await checkPlaylistOwnership(numericPlaylistId, userId); // Ném lỗi nếu không hợp lệ

        // 3. Thực hiện xóa liên kết trong bảng PlaylistTrack
        const result = await db.PlaylistTrack.destroy({
            where: {
                playlistId: numericPlaylistId,
                trackId: numericTrackId
            }
        });

        // 4. Kiểm tra kết quả xóa
        if (result > 0) {
            // Xóa thành công
            console.log(`Service: Track ${numericTrackId} removed from playlist ${numericPlaylistId}`);
            return { success: true, message: "Đã xóa bài hát khỏi playlist." };
        } else {
            // Nếu không có dòng nào bị xóa -> track không có trong playlist đó
            const error = new Error("Track not found in playlist");
            error.statusCode = 404;
            throw error;
        }
    } catch (error) {
        console.error(`Error removing track ${trackId} from playlist ${playlistId} for user ${userId}:`, error);
        // Gán statusCode mặc định nếu chưa có
        if (!error.statusCode) {
             error.statusCode = 500;
        }
        throw error; // Ném lại lỗi để controller xử lý
    }
};

// =============================================
// === HÀM LẤY TRACKS TRONG PLAYLIST ===
// =============================================
/**
 * Lấy danh sách các track trong một playlist cụ thể, bao gồm metadata (trackname).
 * Trả về đường dẫn ảnh/nhạc gốc từ DB.
 */
const getPlaylistDetailsById = async (playlistId) => {
    const numericPlaylistId = Number(playlistId);
    if (isNaN(numericPlaylistId)) {
        const error = new Error("Playlist ID không hợp lệ.");
        error.statusCode = 400;
        throw error;
    }

    try {
        // --- BƯỚC 1: Lấy thông tin cơ bản của Playlist VÀ User tạo Playlist ---
        console.log(`[Service] Finding playlist with ID: ${numericPlaylistId}`); // Thêm log
        const playlistInfo = await db.Playlist.findByPk(numericPlaylistId, {
            attributes: ['id', 'title', 'imageUrl', 'createDate', 'userId'],
            include: [ { model: db.User, attributes: ['id', 'userName'] } ]
        });

        // Log kết quả tìm kiếm playlist
        if (playlistInfo) {
            console.log(`[Service] Found playlist: ${JSON.stringify(playlistInfo.get({ plain: true }))}`);
        } else {
            console.warn(`[Service] Playlist with ID ${numericPlaylistId} not found by findByPk.`);
            const error = new Error('Playlist not found');
            error.statusCode = 404;
            throw error; // Ném lỗi 404 nếu không tìm thấy
        }

        // --- BƯỚC 2: Lấy danh sách Tracks trong Playlist ---
        const playlistTracksRaw = await db.PlaylistTrack.findAll({
            where: { playlistId: numericPlaylistId },
            include: [
                {
                    model: db.Track,
                    attributes: ['id', 'trackUrl', 'imageUrl'], // Lấy trackUrl, imageUrl gốc từ DB
                    include: [ { model: db.User, attributes: ['id', 'userName'] } ],
                    required: true
                }
            ],
        });

        const tracks = playlistTracksRaw.map(pt => pt.Track.get({ plain: true }));
        const trackIds = new Set(tracks.map(track => track.id).filter(id => id != null));

        // --- BƯỚC 3: Lấy Metadata (trackname) cho các Tracks ---
        let metadataMap = new Map();
        if (trackIds.size > 0) {
            const metadataResults = await db.Metadata.findAll({
                where: { track_id: { [Op.in]: Array.from(trackIds) } },
                attributes: ['track_id', 'trackname'],
                raw: true
            });
            metadataResults.forEach(meta => { metadataMap.set(meta.track_id, meta.trackname); });
        }

        // --- BƯỚC 4: Gán title và định dạng lại mảng Tracks (trả về đường dẫn tương đối) ---
        const formattedTracks = tracks.map(track => {
            const trackArtist = track.User ? track.User.userName : "Unknown Artist";

            // Lấy đường dẫn gốc từ DB hoặc null
            const trackUrlValue = track.trackUrl || null; // <-- Lấy giá trị trackUrl
            const trackCover = track.imageUrl || "/assets/default_track_cover.png"; // Giữ fallback cho cover

            return {
                id: track.id,
                title: metadataMap.get(track.id) || "Unknown Title",
                // --- SỬA Ở ĐÂY ---
                trackUrl: trackUrlValue, // <-- Trả về dưới tên key là trackUrl
                // ---------------
                // Giả định User của track là artist
                artist: trackArtist,
                // Giả định imageUrl của track là cover
                imageUrl: trackCover // <-- Trả về dưới tên key là imageUrl
            };
        });

        // --- BƯỚC 5: Gộp tất cả thông tin thành object cuối cùng ---
        // Trả về đường dẫn tương đối cho ảnh playlist
        const playlistImageUrl = playlistInfo.imageUrl || null;

        const fullPlaylistData = {
            id: playlistInfo.id,
            title: playlistInfo.title || "Untitled Playlist",
            User: playlistInfo.User ? { userName: playlistInfo.User.userName } : { userName: "Unknown Artist" },
            createDate: playlistInfo.createDate,
            imageUrl: playlistImageUrl, // <-- Giữ nguyên imageUrl cho playlist
            // Đổi tên key chứa mảng track thành Tracks (viết hoa) để khớp frontend map ban đầu
            Tracks: formattedTracks // <-- Mảng track giờ có key là trackUrl và imageUrl
        };

        console.log("[Service] Successfully fetched and formatted playlist details."); // Log thành công
        return fullPlaylistData; // Trả về object đầy đủ

    } catch (error) {
        // Log lỗi chi tiết hơn
        console.error(`[Service] Error fetching details for playlist ${playlistId}:`, error.message, error.stack);
        if (!error.statusCode) {
            error.statusCode = 500; // Lỗi không xác định
        }
        throw error; // Ném lỗi để controller bắt
    }
};



// --- Export các hàm ---
export {
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    // getTracksInPlaylist,
    getPlaylistDetailsById
};
