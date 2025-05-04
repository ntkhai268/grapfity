import { likeTrack, unlikeTrack, getLikedTracksByUser } from '../services/like_service.js';
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
    const JWT = req.cookies;
    const data = verityJWT(JWT.jwt);
    const userId = data.userId;

    try {
        const likedTrack = await getLikedTracksByUser(userId);
        res.status(200).json({ message: 'Lấy danh sách like thành công', likedTrack });
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

// ✅ Xuất theo chuẩn ES module
export {
    likeTrackController,
    getLikedTracksByUserController,
    unlikeTrackController
};
