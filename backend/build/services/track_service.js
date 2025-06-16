import { Sequelize, Transaction } from 'sequelize';
import db from '../models/index.js';
import { extractMetadata, checkMetadataSimilarity } from '../services/metadata_service.js';
const getAllTracks = async () => {
  return await db.Track.findAll({
    where: {
      privacy: 'public'
    },
    include: [{
      model: db.Metadata
    }, {
      model: db.User,
      attributes: ['id', 'Name']
    }]
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
const getTrackById = async trackId => {
  const numericTrackId = Number(trackId);
  if (isNaN(numericTrackId)) {
    console.error(`TrackService: Invalid track ID received in getTrackById: ${trackId}`);
    return null;
  }
  try {
    const track = await db.Track.findOne({
      where: {
        id: numericTrackId,
      },
      // Bạn có thể chọn các attributes cụ thể từ bảng Track nếu muốn
      attributes: ['id', 'trackUrl', 'imageUrl', 'uploaderId', 'createdAt', 'updatedAt', 'privacy'],
      include: [{
        model: db.User,
        // Nếu bạn muốn lấy thông tin người upload
        attributes: ['id', 'Name']
      }, {
        model: db.Metadata,
        attributes: [
          // Liệt kê các trường bạn muốn lấy từ Metadatum
          'trackname', 'duration_ms', 'explicit', 'danceability', 'energy', 'key', 'loudness', 'mode', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo', 'time_signature', 'year', 'release_date', 'lyrics' // <<<--- ĐẢM BẢO LẤY TRƯỜNG 'lyrics'
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
    throw error;
  }
};
const getTrackWithUploaderById = async id => {
  return await db.Track.findOne({
    where: {
      id,
    },
    include: {
      model: db.User,
      attributes: ['username', 'Name']
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
    ...(isOwner ? {} : {
      privacy: 'public'
    }) // 👈 Nếu không phải chủ sở hữu thì chỉ thấy bài public
  };
  try {
    const tracks = await db.Track.findAll({
      where: whereClause,
      attributes: ['id', 'trackUrl', 'imageUrl', 'uploaderId', 'privacy', 'createdAt', 'updatedAt'],
      include: [{
        model: db.User,
        attributes: ['id', 'Name']
      }, {
        model: db.Metadata,
        attributes: ['trackname', 'duration_ms', 'lyrics']
      }],
      order: [['createdAt', 'DESC']]
    });
    console.log(`TrackService: Found ${tracks.length} tracks for user ID ${numericUserId} (isOwner: ${isOwner})`);
    return tracks;
  } catch (error) {
    console.error(`TrackService: Error fetching tracks for user ID ${numericUserId}:`, error);
    throw error;
  }
};
const createTrack = async ({
  trackUrl,
  imageUrl,
  uploaderId,
  privacy,
  absAudioPath,
  trackname
}) => {
  const metadata = await extractMetadata(absAudioPath);
  metadata.trackname = trackname;
  metadata.lyrics = '';
  const approved = await checkMetadataSimilarity(metadata);
  if (!approved) {
    throw new Error('Khong the them Track vi ly do ban quyen');
  }
  const newTrack = await db.Track.create({
    trackUrl,
    imageUrl,
    uploaderId,
    privacy,
  });
  metadata.track_id = newTrack.id;
  const {
    track_id,
    explicit,
    danceability,
    energy,
    key,
    loudness,
    mode,
    speechiness,
    acousticness,
    instrumentalness,
    liveness,
    valence,
    tempo,
    duration_ms,
    time_signature,
    year,
    release_date,
    lyrics
  } = metadata;
  await db.Metadata.create({
    trackname,
    track_id,
    explicit,
    danceability,
    energy,
    key,
    loudness,
    mode,
    speechiness,
    acousticness,
    instrumentalness,
    liveness,
    valence,
    tempo,
    duration_ms,
    time_signature,
    year,
    release_date,
    lyrics
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
const deleteTrack = async trackId => {
  await db.sequelize.transaction(async t => {
    await db.PlaylistTrack.destroy({
      where: {
        trackId
      },
      transaction: t
    });
    await db.Track.destroy({
      where: {
        id: trackId
      },
      individualHooks: true,
      transaction: t
    });
  });
};

//dangkhoi them
const getTracksByUserId = async userId => {
  return await db.Track.findAll({
    where: {
      uploaderId: userId
    },
    include: [
      {
        model: db.User,
        attributes: [['name', 'UploaderName']],
        required: false
      }, {
        model: db.listeningHistory,
        attributes: ['listenCount', 'createdAt'],
        include: [
          {
            model: db.User,
            attributes: ['id', 'Name']
          }]
      },{
        model: db.Metadata,
        attributes: ['trackname']
      }]
  });
};

const getJoinedTracks = async () => {
  return await db.Track.findAll({
    attributes: ['id', 'trackUrl', 'imageUrl', 'uploaderId', 'createdAt'],
    include: [{
      model: db.Metadata,
      attributes: ['trackname'],
      required: false
    }, {
      model: db.User,
      attributes: [['name', 'UploaderName']],
      required: false
    }, {
      model: db.listeningHistory,
      attributes: ['listenCount', 'createdAt'],
      required: false,
      include: [{
        model: db.User,
        attributes: [['name', 'Name']],
        required: false
      }]
    }]
  });
};
export { getAllTracks, getAllTracksForAdmin, getTrackById, getTrackWithUploaderById, getTracksByUploaderId, createTrack, updateTrack, deleteTrack, getTracksByUserId, getJoinedTracks };