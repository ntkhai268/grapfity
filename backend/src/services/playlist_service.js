import db from '../models/index.js';
import { Op } from 'sequelize';

const getAllPlaylistsByUserId = async (userId) => {
    try {
        const playlists = await db.Playlist.findAll({
            where: { userId: userId },
            include: [
                {
                    model: db.Track,
                    attributes: ['id', 'trackUrl', 'imageUrl'],
                    include: [
                        {
                            model: db.User,
                            attributes: ['id','userName','Name']
                        },
                        {
                            model: db.Metadata,
                            as: 'Metadatum', // QUAN TRỌNG: Dùng alias 'Metadatum' (số ít, viết hoa M)
                                             // nếu Track.hasOne(models.Metadata) không có 'as'
                                             // Hoặc dùng alias bạn đã đặt trong Track.hasOne(models.Metadata, { as: '...' })
                            attributes: ['trackname', 'duration_ms'] // Các trường cần từ Metadata
                        }
                    ],
                    
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

// const updatePlaylist = async (id, title, imageUrl) => {
//     const playlist = await db.Playlist.findByPk(id);
//     await playlist.update({ title, imageUrl });
//     return playlist;
// };


/**
 * Cập nhật thông tin (title, imageUrl) của một playlist, sau khi kiểm tra quyền sở hữu.
 * @param {number} playlistId ID của playlist cần cập nhật.
 * @param {number} userId ID của người dùng yêu cầu cập nhật (để kiểm tra quyền). // <-- Thêm lại userId
 * @param {string} title Tiêu đề mới cho playlist.
 * @param {string | null} imageUrl URL ảnh mới cho playlist (có thể là null).
 * @returns {Promise<object>} Object playlist đã được cập nhật.
 * @throws {Error} Ném lỗi với statusCode (404, 403, 400, 500) nếu có lỗi.
 */
const updatePlaylist = async (playlistId, userId, title, imageUrl) => { // <-- Thêm lại userId
    // Validate input cơ bản
    const numericPlaylistId = Number(playlistId);
    // Thêm lại kiểm tra userId
    if (isNaN(numericPlaylistId) || !userId) {
        const error = new Error("Dữ liệu không hợp lệ (playlistId hoặc userId)."); // <-- Sửa lại thông báo lỗi
        error.statusCode = 400;
        throw error;
    }
    // Validation cho title
    if (typeof title !== 'string' || title.trim() === '') {
         const error = new Error("Tiêu đề playlist không được để trống.");
         error.statusCode = 400;
         throw error;
    }
     // Validation cho imageUrl
    if (imageUrl !== null && typeof imageUrl !== 'string') {
         const error = new Error("Định dạng imageUrl không hợp lệ.");
         error.statusCode = 400;
         throw error;
    }


    try {
        // --- BƯỚC 1: Tìm playlist và kiểm tra quyền sở hữu ---
        // Sử dụng findOne với cả id và userId
        console.log(`[Service] Finding playlist ${numericPlaylistId} for update by user ${userId}`);
        const playlistToUpdate = await db.Playlist.findOne({ // <-- Dùng findOne
            where: {
                id: numericPlaylistId,
                userId: userId // <-- Thêm lại kiểm tra userId (sử dụng đúng tên cột 'userId')
            }
        });

        // --- BƯỚC 2: Xử lý nếu không tìm thấy hoặc không có quyền ---
        if (!playlistToUpdate) {
            // Kiểm tra xem playlist có tồn tại nhưng không thuộc user này không
            console.log(`[Service] Playlist ${numericPlaylistId} not found or user ${userId} does not own it. Checking existence with findByPk...`); // Log trước khi kiểm tra
            
            console.log(`[Service] About to execute findByPk(${numericPlaylistId})`);

            const exists = await db.Playlist.findByPk(numericPlaylistId);
            // --- THÊM LOG KẾT QUẢ findByPk ---
            console.log(`[Service] Result of findByPk(${numericPlaylistId}):`, exists ? `Found (ID: ${exists.id})` : 'Not Found (null)');
            // ---------------------------------
            if (exists) {
                // Playlist tồn tại nhưng userId không khớp -> Lỗi quyền
                console.warn(`[Service] Permission denied for user ${userId} to update playlist ${numericPlaylistId}`);
                const error = new Error('Permission denied'); // Không có quyền
                error.statusCode = 403; // <-- Trả về lỗi 403
                throw error;
            } else {
                // Playlist không tồn tại (findByPk trả về null)
                console.warn(`[Service] Playlist ${numericPlaylistId} not found for update (confirmed by findByPk).`); // Log rõ hơn
                const error = new Error('Playlist not found'); // Không tìm thấy
                error.statusCode = 404; // <-- Trả về lỗi 404
                throw error;
            }
        }

        // --- BƯỚC 3: Thực hiện cập nhật ---
        console.log(`[Service] Updating playlist ${numericPlaylistId} with title: "${title}", imageUrl: "${imageUrl}"`);
        // Chỉ cập nhật các trường được phép
        await playlistToUpdate.update({
             title: title,
             imageUrl: imageUrl // Cập nhật imageUrl (có thể là null)
        });

        // --- BƯỚC 4: Trả về playlist đã cập nhật ---
        // playlistToUpdate đã được cập nhật tại chỗ bởi lệnh update()
        console.log(`[Service] Playlist ${numericPlaylistId} updated successfully by user ${userId}.`);
        return playlistToUpdate; // Trả về đối tượng đã cập nhật

    } catch (error) {
        // Bắt các lỗi khác (ví dụ: lỗi database khi update)
        console.error(`[Service] Error updating playlist ${playlistId} by user ${userId}:`, error); // Thêm userId vào log lỗi
        if (!error.statusCode) {
            error.statusCode = 500; // Lỗi server mặc định
        }
        throw error; // Ném lại lỗi để controller xử lý
    }
};


const deletePlaylist = async (playlistId, userId) => {
    // Validate input (đảm bảo ID là số hợp lệ)
    const numericPlaylistId = Number(playlistId);
    if (isNaN(numericPlaylistId) || !userId) {
        const error = new Error("Dữ liệu không hợp lệ (playlistId hoặc userId).");
        error.statusCode = 400;
        throw error;
    }

    // Sử dụng transaction để đảm bảo cả hai thao tác xóa đều thành công hoặc thất bại cùng nhau
    const t = await db.sequelize.transaction(); // <-- Bắt đầu transaction

    try {
        // --- BƯỚC 1: Kiểm tra sự tồn tại và quyền sở hữu của Playlist ---
        console.log(`[Service] Checking ownership for playlist ${numericPlaylistId}, user ${userId}`);
        const playlistToDelete = await db.Playlist.findOne({
            where: {
                id: numericPlaylistId, // Giả sử cột ID trong Playlist là 'id'
                // --- SỬA TÊN CỘT Ở ĐÂY ---
                // Sử dụng tên cột 'userId' (viết hoa I) như trong schema DB
                userId: userId
                // -------------------------
            },
            transaction: t // Thực hiện trong transaction
        });

        // Nếu không tìm thấy playlist hoặc không đúng chủ sở hữu
        if (!playlistToDelete) {
            // Kiểm tra xem playlist có tồn tại nhưng không thuộc user này không
            const exists = await db.Playlist.findByPk(numericPlaylistId, { transaction: t });
            if (exists) {
                console.warn(`[Service] Permission denied for user ${userId} on playlist ${numericPlaylistId}`);
                const error = new Error('Permission denied'); // Không có quyền
                error.statusCode = 403;
                throw error; // Lỗi sẽ được bắt và rollback ở catch
            } else {
                console.warn(`[Service] Playlist ${numericPlaylistId} not found`);
                const error = new Error('Playlist not found'); // Không tìm thấy
                error.statusCode = 404;
                throw error; // Lỗi sẽ được bắt và rollback ở catch
            }
        }

        // --- BƯỚC 2: Xóa các liên kết trong PlaylistTrack TRƯỚC ---
        console.log(`[Service] Deleting PlaylistTrack entries for playlist ${numericPlaylistId}`);
        await db.PlaylistTrack.destroy({
            where: {
                // --- SỬA TÊN CỘT Ở ĐÂY ---
                // Sử dụng tên cột 'playlistId' (viết hoa I) như trong schema DB
                playlistId: numericPlaylistId
                // -------------------------
            },
            transaction: t // Thực hiện trong transaction
        });

        // --- BƯỚC 3: Xóa bản ghi Playlist ---
        console.log(`[Service] Deleting Playlist ${numericPlaylistId}`);
        // Không cần `where` nữa vì đã tìm thấy và kiểm tra quyền ở Bước 1
        // Chỉ cần destroy đối tượng đã tìm thấy
        await playlistToDelete.destroy({ transaction: t });

        // --- BƯỚC 4: Commit Transaction ---
        await t.commit(); // Hoàn tất transaction nếu mọi thứ thành công
        console.log(`[Service] Playlist ${numericPlaylistId} deleted successfully.`);

    } catch (error) {
        // Nếu có lỗi, rollback transaction
        console.error(`[Service] Error deleting playlist ${numericPlaylistId}:`, error);
        // Đảm bảo rollback chỉ được gọi một lần và khi transaction còn hoạt động
        if (t && !t.finished) { // Kiểm tra xem transaction đã kết thúc chưa
             await t.rollback();
             console.log(`[Service] Transaction rolled back for playlist ${numericPlaylistId}.`);
        }


        // Ném lại lỗi để controller xử lý (giữ nguyên statusCode nếu có)
        if (!error.statusCode) {
            // Kiểm tra xem có phải lỗi từ DB không
             if (error.name === 'SequelizeDatabaseError') {
                 // Có thể đây là lỗi "Invalid column name" hoặc lỗi DB khác
                 console.error("[Service] Database Error:", error.original?.message || error.message);
                 // Không ghi đè statusCode nếu đã có
                 if(!error.statusCode) error.statusCode = 500;
             } else {
                 error.statusCode = 500; // Lỗi server mặc định cho các lỗi khác
             }
        }
        throw error;
    }
};
/**
 * Lấy thông tin chi tiết một playlist bằng ID, bao gồm tracks và metadata (trackname).
 */
// -------------------
// const getPlaylistById = async (playlistId) => {
//     const numericPlaylistId = Number(playlistId);
//      if (isNaN(numericPlaylistId)) {
//          console.error(`Invalid playlist ID received in getPlaylistById: ${playlistId}`);
//          // Có thể throw lỗi thay vì return null để controller xử lý nhất quán
//          throw new Error("Playlist ID không hợp lệ.");
//          // return null;
//      }

//     try {
//         // --- TRUY VẤN 1: Lấy Playlist và Tracks ---
//         const playlistRaw = await db.Playlist.findByPk(numericPlaylistId, {
//             include: [
//                 {
//                     model: db.Track,
//                     attributes: ['id', 'trackUrl', 'imageUrl'],
//                     through: { attributes: [] },
//                     include: [
//                         {
//                             model: db.User, // User của Track
//                             attributes: ['id', 'userName']
//                         }
//                     ]
//                 },
//                 {
//                     model: db.User, // User của Playlist
//                     attributes: ['id', 'userName']
//                 }
//             ],
//         });

//         if (!playlistRaw) return null; // Trả về null nếu không tìm thấy

//         const playlist = playlistRaw.get({ plain: true });

//         // --- Thu thập track IDs ---
//         const trackIds = new Set();
//         playlist.Tracks?.forEach(track => {
//              if (track.id) {
//                  trackIds.add(track.id);
//              }
//         });

//         let metadataMap = new Map();

//         // --- TRUY VẤN 2: Lấy Metadata ---
//         if (trackIds.size > 0) {
//              const metadataResults = await db.Metadata.findAll({
//                  where: {
//                      track_id: {
//                          [Op.in]: Array.from(trackIds)
//                      }
//                  },
//                  attributes: ['track_id', 'trackname'],
//                  raw: true
//              });
//              metadataResults.forEach(meta => {
//                  metadataMap.set(meta.track_id, meta.trackname);
//              });
//         }

//         // --- Kết hợp dữ liệu ---
//         playlist.Tracks?.forEach(track => {
//              track.title = metadataMap.get(track.id) || "Unknown Title";
//         });

//         if (!playlist.Tracks) {
//              playlist.Tracks = [];
//         }

//         return playlist;

//     } catch (error) {
//         console.error(`Error fetching playlist with ID ${numericPlaylistId}:`, error);
//          if (error.sql) {
//               console.error("Failed SQL:", error.sql);
//          }
//         throw error;
//     }
// };


// ------------

export {
    getAllPlaylistsByUserId,
    createPlaylist,
    updatePlaylist,
    // getPlaylistById,
    deletePlaylist
};
