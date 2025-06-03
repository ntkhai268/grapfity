import db from '../models/index.js';

const likeTrack = async (userId, trackId) => {
    return await db.Like.create({ userId, trackId });
};

const unlikeTrack = async (userId, trackId) => {
    return await db.Like.destroy({
        where: {
            userId: userId,
            trackId: trackId
        }
    });
};
const getLikedTracksByUser = async (userId) => {
  return await db.Like.findAll({
    where: { userId },
    include: [
      {
        model: db.Track,
        include: [
          {
            model: db.User,
            attributes: ['id','Name']
          }
        ]
      }
    ]
  });
};

// like_service kiểm tra xem user đã like bài hát đó hay chưa
const isTrackLikedByUser = async (userId, trackId) => {
    const like = await db.Like.findOne({ where: { userId, trackId } });
    return !!like; // trả về true/false
};

// đếm tổng số lượt like của 1 bài hát
const countLikesForTrack = async (trackId) => {
    return await db.Like.count({ where: { trackId } });
};
// ✅ Xuất các hàm theo chuẩn ES module
export {
    likeTrack,
    unlikeTrack,
    getLikedTracksByUser,
    isTrackLikedByUser,
    countLikesForTrack
};
