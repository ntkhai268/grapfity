import { Sequelize, Transaction } from 'sequelize';
import db from '../models/index.js';

const getAllTracks = async () => {
    return await db.Track.findAll({
        where: {
            status: 'approved',
            privacy: 'public'
            
        },
        include: [
            {
                model: db.Metadata
            },
            {
                model: db.User, // ✅ KHÔNG dùng `as`
                attributes: ['id', 'Name']
            }
        ]
    }); // Lấy tất cả dữ liệu trong bảng Track
};

const getAllTracksForAdmin = async () => {
    return await db.Track.findAll({
        include: {
            model: db.Metadata
        },
        order: [['createdAt', 'DESC']]
    });
};


const getTrackById = async (trackId) => {
    const numericTrackId = Number(trackId);
    if (isNaN(numericTrackId)) {
        console.error(`TrackService: Invalid track ID received in getTrackById: ${trackId}`);
        return null;
    }

    try {
        const track = await db.Track.findOne( {
            where: {
                id: numericTrackId,
                status: 'approved' 
            },
            // Bạn có thể chọn các attributes cụ thể từ bảng Track nếu muốn
            attributes: ['id', 'trackUrl', 'imageUrl', 'uploaderId', 'createdAt', 'updatedAt', 'privacy'], 
            include: [
                {
                    model: db.User, // Nếu bạn muốn lấy thông tin người upload
                    as: 'User',     // Đảm bảo alias 'User' khớp với định nghĩa trong model Track
                                    // Ví dụ: Track.belongsTo(models.User, { as: 'User', ...})
                                    // Bỏ 'as' nếu không đặt alias cụ thể trong association.
                    attributes: ['id', 'Name']
                },
                {
                    model: db.Metadata,
                    as: 'Metadatum', // QUAN TRỌNG: Sử dụng alias 'Metadatum' (số ít, viết hoa M)
                                     // nếu Track.hasOne(models.Metadata) không có 'as' trong định nghĩa model.
                                     // Hoặc dùng alias bạn đã đặt trong Track.hasOne(models.Metadata, { as: 'yourAlias' })
                    attributes: [ // Liệt kê các trường bạn muốn lấy từ Metadatum
                        'trackname',
                        'duration_ms',
                        'explicit',
                        'danceability',
                        'energy',
                        'key',
                        'loudness',
                        'mode',
                        'speechiness',
                        'acousticness',
                        'instrumentalness',
                        'liveness',
                        'valence',
                        'tempo',
                        'time_signature',
                        'year',
                        'release_date',
                        'lyrics' // <<<--- ĐẢM BẢO LẤY TRƯỜNG 'lyrics'
                    ]
                }
                // Bạn có thể include thêm các model khác liên quan đến Track nếu cần
            ]
        });

        if (!track) {
            console.warn(`TrackService: Track with ID ${numericTrackId} not found.`);
            return null; // Trả về null nếu không tìm thấy track
        }
        return track;

    } catch (error) {
        console.error(`TrackService: Error fetching track with ID ${numericTrackId}:`, error);
        throw error; // Ném lỗi để controller xử lý
    }
};

const getTrackWithUploaderById = async (id) => {
    return await db.Track.findOne({
        where: {
            id,
            status: 'approved' 
        },
        include: {
            model: db.User,
            attributes: ['username', 'Name'],
        }
    });
};

const getTracksByUploaderId = async (userId, currentUserId) => {
  const numericUserId = Number(userId);
  const numericCurrentUserId = Number(currentUserId);

  if (isNaN(numericUserId)) {
    console.error(`TrackService: Invalid user ID received in getTracksByUploaderId: ${userId}`);
    throw new Error("User ID không hợp lệ.");
  }
  console.log(">>🧪 userId:", numericUserId, "currentUserId:", numericCurrentUserId);

  const isOwner = numericUserId === numericCurrentUserId;

  const whereClause = {
    uploaderId: numericUserId,
    status: 'approved',
    ...(isOwner ? {} : { privacy: 'public' }) // 👈 Nếu không phải chủ sở hữu thì chỉ thấy bài public
  };

  try {
    const tracks = await db.Track.findAll({
      where: whereClause,
      attributes: ['id', 'trackUrl', 'imageUrl', 'uploaderId', 'privacy', 'createdAt', 'updatedAt'],
      include: [
        {
          model: db.User,
          as: 'User',
          attributes: ['id', 'Name']
        },
        {
          model: db.Metadata,
          as: 'Metadatum',
          attributes: ['trackname', 'duration_ms', 'lyrics']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`TrackService: Found ${tracks.length} tracks for user ID ${numericUserId} (isOwner: ${isOwner})`);
    return tracks;
  } catch (error) {
    console.error(`TrackService: Error fetching tracks for user ID ${numericUserId}:`, error);
    throw error;
  }
};


const createTrack = async (trackUrl, imageUrl, uploaderId,privacy,  metadata) => {
     const newTrack = await db.Track.create({ trackUrl, imageUrl, uploaderId, status: 'pending', privacy} );
    metadata.track_id = newTrack.id   
    const {
        trackname, track_id, lyrics
    } = metadata
   

    await db.Metadata.create({
        trackname, track_id, lyrics
    });
    return newTrack;
};

// chỉ cho phép user cập nhật bài hát mà họ quản lí, không cập nhật status được
const updateTrack = async (id, updateData, userId) => {
    const track = await db.Track.findByPk(id);
    if (!track) throw new Error('Track not found');
    if (track.uploaderId !== userId) {
        throw new Error('Unauthorized: You can only edit your own tracks.');
    }
    if ('status' in updateData) {
        delete updateData.status;
    }
    // Chỉ cập nhật các trường cho phép
    const allowedFields = ['title', 'imageUrl', 'lyrics', 'privacy'];
    const safeUpdateData = {};
    for (const field of allowedFields) {
        if (field in updateData) {
        safeUpdateData[field] = updateData[field];
        }
    }
    await track.update(safeUpdateData);
    return track;
};

const deleteTrack = async (id, userId) => {
    const track = await db.Track.findByPk(id);
    console.log("track.uploaderId: ", track.uploaderId )
    if (!track|| track.uploaderId !== userId) {
        throw new Error("Unauthorized: You can only delete your own tracks.");
    }
    return await db.sequelize.transaction(async (t) => {
        await db.PlaylistTrack.destroy({ where: { trackId: id }, transaction: t });
        await db.Track.destroy({ where: { id }, individualHooks: true, transaction: t });
    })
};

export {
    getAllTracks,
    getAllTracksForAdmin,
    getTrackById,
    getTrackWithUploaderById,
    getTracksByUploaderId,
    createTrack,
    updateTrack,
    deleteTrack
};
