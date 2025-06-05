import db from '../models/index.js';
const getAllPlaylistsByUserId = async (userId, currentUserId) => {
  try {
    const isOwner = Number(userId) === Number(currentUserId); // 👈 So sánh người dùng

    const playlists = await db.Playlist.findAll({
      where: {
        userId: userId,
        ...(isOwner ? {} : { privacy: 'public' }) // 👈 Nếu không phải chủ sở hữu, chỉ thấy public
      },
      include: [
         {
            model: db.User, // ✅ Lấy người tạo playlist
            attributes: ['id', 'Name'] 
          },
        {
          model: db.Track,
          attributes: ['id', 'trackUrl', 'imageUrl', 'trackname', 'duration_ms'],
          include: [
            {
              model: db.User,
              attributes: ['id', 'userName', 'Name']
            },
          ],
        }
      ]
    });

    return playlists;
  } catch (error) {
    console.error('Error fetching playlists:', error);
    throw error;
  }
};
const getAllPublicPlaylists = async () => {
  return await db.Playlist.findAll({
    where: { privacy: 'public' },
    include: [
      {
        model: db.User,
        attributes: ['id', 'Name']
      },
      {
        model: db.Track,
        attributes: ['id', 'trackUrl', 'imageUrl', 'trackname', 'duration_ms'],
        include: [
          {
            model: db.User,
            attributes: ['id', 'userName', 'Name']
          },
        ]
      }
    ]
  });
};



const createPlaylist = async (userId, trackId) => {
    let title, createDate, imageUrl, privacy;
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

    const newPlaylist = await db.Playlist.create({ userId, title, createDate, imageUrl, privacy });

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
const updatePlaylist = async (playlistId, userId, title, imageUrl, privacy) => {
    const numericPlaylistId = Number(playlistId);

    // Validate playlistId và userId
    if (isNaN(numericPlaylistId) || !userId) {
        const error = new Error("Dữ liệu không hợp lệ (playlistId hoặc userId).");
        error.statusCode = 400;
        throw error;
    }

    // Validate title
    if (typeof title !== 'string' || title.trim() === '') {
        const error = new Error("Tiêu đề playlist không được để trống.");
        error.statusCode = 400;
        throw error;
    }

    // Validate imageUrl (nếu không undefined)
    if (imageUrl !== undefined && imageUrl !== null && typeof imageUrl !== 'string') {
        const error = new Error("Định dạng imageUrl không hợp lệ.");
        error.statusCode = 400;
        throw error;
    }

    // Validate privacy
    if (privacy !== undefined && privacy !== 'public' && privacy !== 'private') {
        const error = new Error("Giá trị privacy không hợp lệ.");
        error.statusCode = 400;
        throw error;
    }

    try {
        console.log(`[Service] Finding playlist ${numericPlaylistId} for update by user ${userId}`);
        const playlistToUpdate = await db.Playlist.findOne({
            where: {
                id: numericPlaylistId,
                userId: userId
            }
        });

        if (!playlistToUpdate) {
            const exists = await db.Playlist.findByPk(numericPlaylistId);
            if (exists) {
                const error = new Error('Permission denied');
                error.statusCode = 403;
                throw error;
            } else {
                const error = new Error('Playlist not found');
                error.statusCode = 404;
                throw error;
            }
        }

        // Chuẩn bị dữ liệu cập nhật
        const updateData = {
            title: title.trim()
        };

        // Chỉ cập nhật imageUrl nếu truyền rõ (undefined = không cập nhật, null = xóa ảnh)
        if (imageUrl !== undefined) {
            updateData.imageUrl = imageUrl; 
        }

        // Cập nhật privacy nếu có
        if (privacy !== undefined) {
            updateData.privacy = privacy;
        }

        console.log(`[Service] Updating playlist ${numericPlaylistId} with data:`, updateData);

        // Thực hiện cập nhật
        await playlistToUpdate.update(updateData);

        console.log(`[Service] Playlist ${numericPlaylistId} updated successfully by user ${userId}.`);
        return playlistToUpdate;

    } catch (error) {
        console.error(`[Service] Error updating playlist ${playlistId} by user ${userId}:`, error);
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        throw error;
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


export {
    getAllPlaylistsByUserId,
    getAllPublicPlaylists,
    createPlaylist,
    updatePlaylist,
    // getPlaylistById,
    deletePlaylist
};
