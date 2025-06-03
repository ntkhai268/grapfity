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
        console.error(`[PlaylistService] Invalid playlist ID: ${playlistId}`);
        const error = new Error("Playlist ID không hợp lệ.");
        error.statusCode = 400;
        throw error;
    }

    console.log(`[PlaylistService] Fetching details for playlist ID: ${numericPlaylistId}`);

    try {
        const playlist = await db.Playlist.findByPk(numericPlaylistId, {
            // Chọn các trường cần thiết từ bảng Playlist
            attributes: ['id', 'title', 'imageUrl', 'createDate', 'userId', 'privacy'], 
            include: [
                {
                    model: db.User, // User tạo Playlist
                    attributes: ['id', 'userName', 'Name'] 
                },
                {
                    model: db.Track,
                    // Chọn các trường cần thiết từ bảng Track
                    attributes: ['id', 'trackUrl', 'imageUrl', 'uploaderId', 'createdAt', 'updatedAt', 'trackname', 'duration_ms', 'lyrics'], 
                    where: { privacy: 'public' },
                    required: false,
                    through: { attributes: [] }, // Quan trọng: Không lấy các trường từ bảng PlaylistTrack
                    // Sắp xếp các track trong playlist nếu cần (ví dụ: theo thứ tự thêm vào)
                    // order: [[ db.PlaylistTrack, 'createdAt', 'ASC' ]], // Cần include PlaylistTrack để order theo nó
                    include: [ // <<< LỒNG INCLUDE CHO TRACK
                        {
                            model: db.User, // User upload Track
                            attributes: ['id', 'userName', 'Name'],
                            // Nếu có alias trong model Track.belongsTo(User), dùng as: '...'
                        }
                    ] // Kết thúc include của Track
                }
            ],
            // Có thể thêm order cho Playlist nếu cần (ví dụ: order tracks)
             // order: [[{ model: db.Track, as: 'Tracks' }, db.PlaylistTrack, 'createdAt', 'ASC']] // Cần cấu hình đúng
        });

        if (!playlist) {
            console.warn(`[PlaylistService] Playlist with ID ${numericPlaylistId} not found.`);
            const error = new Error('Playlist not found');
            error.statusCode = 404;
            throw error; 
        }

        console.log(`[PlaylistService] Successfully fetched details for playlist ID: ${numericPlaylistId}`);
        
        // Sequelize tự động trả về cấu trúc lồng nhau đúng như mong đợi
        // Hàm mapApiDataToPlaylistData ở frontend sẽ xử lý cấu trúc này
        // Có thể trả về plain object nếu muốn chắc chắn
        // return playlist.get({ plain: true }); 
        return playlist;

    } catch (error) {
        console.error(`[PlaylistService] Error fetching details for playlist ${playlistId}:`, error);
        // Ném lỗi để controller bắt và xử lý
        // Nếu lỗi không có statusCode, gán mặc định 500
        if (!error.statusCode) {
             error.statusCode = 500; 
        }
        throw error; 
    }
};
const getPlaylistDetailsByIdforme = async (playlistId, currentUserId) => {
    const numericPlaylistId = Number(playlistId);
    if (isNaN(numericPlaylistId)) {
        console.error(`[PlaylistService] Invalid playlist ID: ${playlistId}`);
        const error = new Error("Playlist ID không hợp lệ.");
        error.statusCode = 400;
        throw error;
    }

    console.log(`[PlaylistService] Fetching details for playlist ID: ${numericPlaylistId}`);

    try {
        const playlist = await db.Playlist.findByPk(numericPlaylistId, {
            attributes: ['id', 'title', 'imageUrl', 'createDate', 'userId', 'privacy'], 
            include: [
                {
                    model: db.User, // Người tạo playlist
                    attributes: ['id', 'userName', 'Name'] 
                },
                {
                    model: db.Track,
                    attributes: ['id', 'trackUrl', 'imageUrl', 'uploaderId', 'createdAt', 'updatedAt', 'trackname', 'duration_ms', 'lyrics'],
                    require: false,
                    through: { attributes: [] },

                    // ✅ LỌC TRACK THEO: public || uploader là chính người dùng hiện tại
                    where: {
                        [Op.or]: [
                            { privacy: 'public' },
                            { uploaderId: currentUserId }
                        ]
                    },

                    include: [
                        {
                            model: db.User,
                            attributes: ['id', 'userName', 'Name'],
                        }
                    ]
                }
            ]
        });

        if (!playlist) {
            console.warn(`[PlaylistService] Playlist with ID ${numericPlaylistId} not found.`);
            const error = new Error('Playlist not found');
            error.statusCode = 404;
            throw error;
        }

        console.log(`[PlaylistService] Successfully fetched details for playlist ID: ${numericPlaylistId}`);
        return playlist;

    } catch (error) {
        console.error(`[PlaylistService] Error fetching details for playlist ${playlistId}:`, error);
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        throw error;
    }
};

// --- Export các hàm ---
export {
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    // getTracksInPlaylist,
    getPlaylistDetailsById,
    getPlaylistDetailsByIdforme
};
