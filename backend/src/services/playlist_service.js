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
                    through: { attributes: [] }, // Không lấy cột của bảng trung gian
                    include: [
                        {
                            model: db.User, // User của Track (uploader)
                            attributes: ['id', 'userName']
                        }
                    ],
                },
                {
                    model: db.User, // User của Playlist (owner)
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
        const trackIds = new Set();
        playlists.forEach(playlist => {
            playlist.Tracks?.forEach(track => {
                if (track.id) {
                    trackIds.add(track.id);
                }
            });
        });

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
                track.title = metadataMap.get(track.id) || "Unknown Title"; // Gán title từ metadata
            });
             // Đảm bảo luôn có mảng Tracks
             if (!playlist.Tracks) {
                 playlist.Tracks = [];
             }
        });

        return playlists;

    } catch (error) {
        console.error(`Error fetching playlists for user ${userId}:`, error);
        if (error.sql) { // Log SQL nếu có lỗi liên quan đến CSDL
             console.error("Failed SQL:", error.sql);
        }
        throw error; // Ném lỗi để controller bắt
    }
};

/**
 * Lấy thông tin chi tiết một playlist bằng ID, bao gồm tracks và metadata (trackname).
 */
const getPlaylistById = async (playlistId) => {
    const numericPlaylistId = Number(playlistId);
     if (isNaN(numericPlaylistId)) {
         console.error(`Invalid playlist ID received in getPlaylistById: ${playlistId}`);
         // Có thể throw lỗi thay vì return null để controller xử lý nhất quán
         throw new Error("Playlist ID không hợp lệ.");
         // return null;
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

        if (!playlistRaw) return null; // Trả về null nếu không tìm thấy

        const playlist = playlistRaw.get({ plain: true });

        // --- Thu thập track IDs ---
        const trackIds = new Set();
        playlist.Tracks?.forEach(track => {
             if (track.id) {
                 trackIds.add(track.id);
             }
        });

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


/**
 * Tạo playlist mới.
 */
const createPlaylist = async (userId, trackId) => {
    // ... (Giữ nguyên logic hàm createPlaylist của bạn) ...
    let title, createDate, imageUrl;
    const playlistCount = await db.Playlist.count({
        where: { userId: userId }
    });

    if (!trackId) {
        title = "Danh sách phát của tôi #" + (playlistCount + 1);
        createDate = new Date();
        imageUrl = ""; // Có thể đặt ảnh mặc định
    } else {
        const numericTrackId = Number(trackId);
        if (isNaN(numericTrackId)) {
            throw new Error("Track ID không hợp lệ.");
        }
        try {
            const track = await db.Track.findByPk(numericTrackId, {
                 include: [{ model: db.Metadata, attributes: ['trackname'], required: false }]
            });
            if (!track) {
                // Throw lỗi cụ thể để controller bắt statusCode 404
                const error = new Error('Không tìm thấy bài hát');
                error.statusCode = 404; // Gán statusCode nếu muốn
                throw error;
            }
            const trackName = track.Metadata?.trackname;
            title = `Playlist từ bài hát ${trackName || `#${track.id}`}`;
            createDate = new Date();
            imageUrl = track.imageUrl || ""; // Lấy ảnh track làm ảnh playlist
        } catch (error) {
            console.error('Error finding track for playlist creation:', error.message);
            throw error; // Ném lại lỗi để controller bắt
        }
    }

    // Tạo playlist mới
    const newPlaylist = await db.Playlist.create({ userId, title, createDate, imageUrl });

    // Nếu tạo từ trackId, thêm track đó vào playlist mới
    if (trackId && newPlaylist) {
         const numericTrackId = Number(trackId); // Đã kiểm tra isNaN ở trên
         try {
             // Gọi hàm service mới để thêm track (hoặc tạo trực tiếp ở đây)
             await addTrackToPlaylist(newPlaylist.id, numericTrackId, userId);
             // Lấy lại thông tin playlist đầy đủ sau khi thêm track
             const playlistWithTrack = await getPlaylistById(newPlaylist.id);
             return playlistWithTrack;

         } catch (assocError) {
              console.error(`Error associating track ${trackId} with new playlist ${newPlaylist.id}:`, assocError);
              // Trả về playlist vừa tạo dù chưa thêm được track (hoặc throw lỗi tùy logic)
              const createdPlaylistData = await getPlaylistById(newPlaylist.id);
              return createdPlaylistData;
         }
    }
    // Trả về playlist vừa tạo (trường hợp không có trackId ban đầu)
    const createdPlaylistData = await getPlaylistById(newPlaylist.id);
    return createdPlaylistData;
};


/**
 * Cập nhật playlist.
 */
const updatePlaylist = async (playlistId, title, imageUrl, userId) => {
    try {
        const numericPlaylistId = Number(playlistId);
        if (isNaN(numericPlaylistId)) {
             throw new Error("Playlist ID không hợp lệ.");
        }
        const playlist = await db.Playlist.findByPk(numericPlaylistId);
        // Kiểm tra không tìm thấy playlist
        if (!playlist) {
            const error = new Error('Không tìm thấy playlist.');
            error.statusCode = 404;
            throw error;
        };
        // Kiểm tra quyền sở hữu
        if (playlist.userId !== userId) {
             console.warn(`User ${userId} attempted to update playlist ${numericPlaylistId} owned by user ${playlist.userId}`);
             const error = new Error('Permission denied'); // Lỗi phân quyền
             error.statusCode = 403; // Forbidden
             throw error;
        }

        // Chỉ cập nhật nếu title hoặc imageUrl được cung cấp và hợp lệ
        const updateData = {};
        if (title !== undefined && title !== null) { // Cho phép title rỗng ""
            updateData.title = title;
        }
        if (imageUrl !== undefined) { // Cho phép imageUrl rỗng "" hoặc null
            updateData.imageUrl = imageUrl;
        }

        // Chỉ thực hiện update nếu có dữ liệu cần update
        if (Object.keys(updateData).length > 0) {
             await playlist.update(updateData);
        }

        // Lấy lại dữ liệu đã cập nhật đầy đủ
        const updatedPlaylistData = await getPlaylistById(numericPlaylistId);
        return updatedPlaylistData;

    } catch (error) {
         console.error(`Error updating playlist ${playlistId}:`, error);
         throw error; // Ném lỗi để controller bắt
    }
};

/**
 * Xóa track khỏi playlist.
 */
const removeTrackFromPlaylist = async (playlistId, trackId, userId) => {
    try {
        const numericPlaylistId = Number(playlistId);
        const numericTrackId = Number(trackId);
        if (isNaN(numericPlaylistId) || isNaN(numericTrackId)) {
             throw new Error("Playlist ID hoặc Track ID không hợp lệ.");
        }
        // Kiểm tra quyền sở hữu playlist trước khi xóa track
        const playlist = await db.Playlist.findOne({
             where: { id: numericPlaylistId, userId: userId }
        });
        if (!playlist) {
             // Phân biệt không tìm thấy và không có quyền
             const existingPlaylist = await db.Playlist.findByPk(numericPlaylistId);
             if (!existingPlaylist) {
                throw new Error('Playlist not found'); // Ném lỗi để controller trả 404
             } else {
                throw new Error('Permission denied'); // Ném lỗi để controller trả 403
             }
        }
        // Thực hiện xóa liên kết trong bảng PlaylistTrack
        const result = await db.PlaylistTrack.destroy({
             where: {
                 playlistId: numericPlaylistId,
                 trackId: numericTrackId
             }
        });

        if (result > 0) {
             return { success: true, message: "Đã xóa bài hát khỏi playlist." };
        } else {
             // Nếu không có dòng nào bị xóa -> track không có trong playlist
             throw new Error("Track not found in playlist"); // Ném lỗi để controller trả 404
             // return { success: false, message: "Không tìm thấy bài hát này trong playlist." };
        }
    } catch (error) {
         console.error(`Error removing track ${trackId} from playlist ${playlistId}:`, error);
         throw error; // Ném lỗi để controller bắt
    }
};


// =============================================
// === HÀM MỚI ĐỂ THÊM TRACK VÀO PLAYLIST ===
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
    // 1. Validate Inputs (đã làm trong controller, nhưng kiểm tra lại vẫn tốt)
    const numericPlaylistId = Number(playlistId);
    const numericTrackId = Number(trackId);
    if (isNaN(numericPlaylistId) || isNaN(numericTrackId) || !userId) {
        throw new Error("Dữ liệu đầu vào không hợp lệ (playlistId, trackId, userId).");
    }

    try {
        // 2. Kiểm tra Playlist có tồn tại và User có quyền sở hữu không
        const playlist = await db.Playlist.findOne({
            where: { id: numericPlaylistId, userId: userId }
        });

        if (!playlist) {
            // Phân biệt giữa không tìm thấy và không có quyền
            const existingPlaylist = await db.Playlist.findByPk(numericPlaylistId);
            if (!existingPlaylist) {
                throw new Error('Playlist not found'); // Lỗi 404
            } else {
                throw new Error('Permission denied'); // Lỗi 403
            }
        }

        // 3. Kiểm tra Track có tồn tại không
        const track = await db.Track.findByPk(numericTrackId);
        if (!track) {
            throw new Error('Track not found'); // Lỗi 404
        }

        // 4. Kiểm tra xem Track đã có trong Playlist chưa và Tạo liên kết
        // db.PlaylistTrack.findOrCreate sẽ tìm, nếu không thấy thì tạo mới
        const [playlistTrack, created] = await db.PlaylistTrack.findOrCreate({
            where: {
                playlistId: numericPlaylistId,
                trackId: numericTrackId
            },
            defaults: { // Giá trị mặc định nếu tạo mới
                playlistId: numericPlaylistId,
                trackId: numericTrackId
            }
        });

        // 5. Xử lý kết quả
        if (created) {
            console.log(`Service: Track ${numericTrackId} added to playlist ${numericPlaylistId}`);
            // Trả về bản ghi vừa tạo (hoặc chỉ message thành công tùy controller)
            return playlistTrack; // Controller sẽ dựa vào đây để trả về 200 hoặc 201
        } else {
            // Nếu không được tạo mới (created = false), nghĩa là đã tồn tại
            console.warn(`Service: Track ${numericTrackId} already exists in playlist ${numericPlaylistId}`);
            throw new Error('Track already exists in playlist'); // Lỗi 409 Conflict
        }

    } catch (error) {
        // Log lỗi chi tiết ở service
        console.error(`Error adding track ${trackId} to playlist ${playlistId} for user ${userId}:`, error);
        // Ném lại lỗi để controller xử lý và trả về status code phù hợp
        throw error;
    }
};


// --- ĐẢM BẢO EXPORT ĐẦY ĐỦ ---
export {
    getAllPlaylistsByUserId,
    createPlaylist,
    updatePlaylist,
    getPlaylistById,
    removeTrackFromPlaylist,
    addTrackToPlaylist // <<< THÊM HÀM MỚI VÀO ĐÂY
};