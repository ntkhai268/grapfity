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
    return await db.Like.findAll({ where: { userId } });
};

// ✅ Xuất các hàm theo chuẩn ES module
export {
    likeTrack,
    unlikeTrack,
    getLikedTracksByUser
};
