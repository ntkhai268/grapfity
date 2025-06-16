import db from '../models/index.js';
import { indexPlaylist, deleteEntity } from './search_service.js';
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
            model: db.User,
            attributes: ['id', 'Name'] 
          },
        {
          model: db.Track,
          attributes: ['id', 'trackUrl', 'imageUrl'],
          include: [
            {
              model: db.User,
              attributes: ['id', 'userName', 'Name']
            },
            {
              model: db.Metadata,
              attributes: ['trackname', 'duration_ms']
            }
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
        attributes: ['id', 'trackUrl', 'imageUrl'],
        include: [
          {
            model: db.User,
            attributes: ['id', 'userName', 'Name']
          },
          {
            model: db.Metadata,
            attributes: ['trackname', 'duration_ms']
          }
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
    await indexPlaylist(newPlaylist);

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
  const numericPlaylistId = Number(playlistId);
  if (isNaN(numericPlaylistId) || !userId) {
    const error = new Error("Dữ liệu không hợp lệ (playlistId hoặc userId).");
    error.statusCode = 400;
    throw error;
  }

  // Kiểm tra quyền sở hữu playlist
  const playlist = await db.Playlist.findOne({
    where: {
      id: numericPlaylistId,
      userId: userId
    }
  });

  if (!playlist) {
    const exists = await db.Playlist.findByPk(numericPlaylistId);
    const error = new Error(exists ? "Permission denied" : "Playlist not found");
    error.statusCode = exists ? 403 : 404;
    throw error;
  }

  // Gọi destroy trên đối tượng đã load – sẽ tự chạy hook afterDestroy
  await playlist.destroy();
  await deleteEntity('playlist', numericPlaylistId);
  return true;
};


export {
    getAllPlaylistsByUserId,
    getAllPublicPlaylists,
    createPlaylist,
    updatePlaylist,
    // getPlaylistById,
    deletePlaylist
};
