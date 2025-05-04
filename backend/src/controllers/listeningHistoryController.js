import { getListeningHistoryOfUser, trackingListeningHistory } from '../services/listeningHistory_service.js';
import { verityJWT } from '../middleware/JWTActions.js';

const getListeningHistoryOfUserController = async (req, res) => {
    const JWT = req.cookies;
    const data = verityJWT(JWT.jwt);
    const userId = data.userId;

    try {
        const histories = await getListeningHistoryOfUser(userId);
        res.status(200).json({ message: 'Lấy lịch sử thành công', histories });
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};

const trackingListeningHistoryController = async (req, res) => {
    const JWT = req.cookies;
    const data = verityJWT(JWT.jwt);
    const userId = data.userId;
    const trackId = req.params.trackId;

    try {
        const history = await trackingListeningHistory(userId, trackId);
        res.status(200).json({ message: 'Ok', history });
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};

export {
    getListeningHistoryOfUserController,
    trackingListeningHistoryController
};
