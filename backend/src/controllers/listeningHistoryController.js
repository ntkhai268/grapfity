import { getListeningHistoryOfUser, trackingListeningHistory,getTop10PopularTracks, getTop5TracksOfUser, getTop5TracksByProfile } from '../services/listeningHistory_service.js';
import { verityJWT } from '../middleware/JWTActions.js';

  const getListeningHistoryOfUserController = async (req, res) => {
    const JWT = req.cookies;
    const data = verityJWT(JWT.jwt);
    const userId = data.userId;
  
    try {
      const histories = await getListeningHistoryOfUser(userId);
      res.status(200).json({
        message: 'Lấy lịch sử thành công',
        data: histories
      });
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
    
    console.log(userId)

    try {
        const history = await trackingListeningHistory(userId, trackId);
        res.status(200).json({ message: 'Ok', history });
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};
const getTop10PopularTracksController = async (req, res) => {
    try {
         console.log("[getTop10PopularTracks] Start querying popular tracks...");
        const results = await getTop10PopularTracks();
          console.log("[getTop10PopularTracks] Query result:", results);

        res.status(200).json(results);
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};

const getTop5TracksOfUserController = async (req, res) => {
    const JWT = req.cookies;
    const data = verityJWT(JWT.jwt);
    const userId = data.userId;

    try {
        const results = await getTop5TracksOfUser(userId);
       res.status(200).json(results);
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
};

const getTop5TracksByProfileController = async (req, res) => {
  try {
    const userId = req.params.userId;
    // Có thể check quyền nếu muốn bảo mật hơn

    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const results = await getTop5TracksByProfile(userId);
    res.status(200).json(results);
  } catch (err) {
    console.error('Database connection failed:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



export {
    getListeningHistoryOfUserController,
    trackingListeningHistoryController,
    getTop10PopularTracksController,
    getTop5TracksOfUserController,
    getTop5TracksByProfileController // LẤY 5 BÀI CỦA USER UPLOAD DC NGHE NHIỀU NHẤT ĐỂ HIỂN THỊ
};
