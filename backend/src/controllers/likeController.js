import { likeTrack, unlikeTrack, getLikedTracksByUser, isTrackLikedByUser,countLikesForTrack } from '../services/like_service.js';
import { verityJWT } from '../middleware/JWTActions.js';

const likeTrackController = async (req, res) => {
    const JWT = req.cookies;
    const data = verityJWT(JWT.jwt);
    const userId = data.userId;
    const trackId = req.params.trackId;

    try {
        const like = await likeTrack(userId, trackId);
        res.status(200).json({ message: 'Like thành công', like });
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};

const getLikedTracksByUserController = async (req, res) => {
    const userId = req.params.userId;

    try {
        const likedTrack = await getLikedTracksByUser(userId);
        const formattedTracks = likedTrack
        .filter(like => like.Track)
        .map(like => like.Track);
        res.status(200).json({
        message: 'Lấy danh sách like thành công',
        data: formattedTracks
});
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};

const unlikeTrackController = async (req, res) => {
    const JWT = req.cookies;
    const data = verityJWT(JWT.jwt);
    const userId = data.userId;
    const trackId = req.params.trackId;

    try {
        await unlikeTrack(userId, trackId);
        res.status(200).json({ message: 'Unlike thành công' });
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};
// kiểm tra xem user đã like 1 bài hát đó chưa
const isTrackLikedByUserController = async (req, res) => {
    const JWT = req.cookies;
    const data = verityJWT(JWT.jwt);
    const userId = data.userId;
    const trackId = req.params.trackId;

    try {
        const isLiked = await isTrackLikedByUser(userId, trackId);
        res.status(200).json({ isLiked });
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};

// đếm số lượt like của 1 bài hát
const countLikesForTrackController = async (req, res) => {
    const trackId = req.params.trackId;
    try {
        const count = await countLikesForTrack(trackId);
        res.status(200).json({ trackId, likeCount: count });
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};


// ✅ Xuất theo chuẩn ES module
export {
    likeTrackController,
    getLikedTracksByUserController,
    unlikeTrackController,
    isTrackLikedByUserController,
    countLikesForTrackController
};
