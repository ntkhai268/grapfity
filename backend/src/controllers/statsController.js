import { getRecentlyTracks } from "../services/stats_service.js"
import { verityJWT } from "../middleware/JWTActions.js"

const getRecentlyTracksController = async (req, res) => {
    const JWT = req.cookies;
    const data = verityJWT(JWT.jwt);
    const userId = data.userId;

    try {
        const tracks = await getRecentlyTracks(userId);
        res.status(200).json({ message: 'Lấy bài hát thành công', tracks });
    } catch (err) {
        console.error('Database connection failed:', err);
        res.status(500).send('Internal Server Error');
    }
}

const getTracksByUserController = async (req, res) => {
  try {
    const { jwt } = req.cookies;
    const { userId } = verityJWT(jwt);
    const tracks = await getTracksByUserId(userId);

    // 2. Chuyển về plain object và chỉ giữ listenCount + listener
    const filtered = tracks.map(track => {
      // toJSON() để có object thuần
      const t = track.toJSON();
      return {
        ...t,
        listeningHistories: (t.listeningHistories || []).map(hist => ({
          metadata: hist.metadata,
          listenCount: hist.listenCount,
          listener: hist.listener
        }))
      };
    });
    return res.status(200).json({
      message: 'Get user tracks succeed!',
      data: filtered
    });
  } catch (err) {
    console.error('Error fetching user tracks:', err);
    return res.status(500).send('Internal Server Error');
  }
};

const getJoinedTracksController = async (req, res) => {
  try {
    const data = await getJoinedTracks();

    // Loại bỏ trường 'track' trong từng listeningHistories nếu có
    const cleaned = data.map(t => {
      const tJSON = t.toJSON();
      if (Array.isArray(tJSON.listeningHistories)) {
        tJSON.listeningHistories = tJSON.listeningHistories.map(hist => {
          const { track, ...rest } = hist; // xoá trường 'track'
          return rest;
        });
      }
      return tJSON;
    });

    return res.status(200).json({
      message: 'Get joined tracks succeed!',
      data: cleaned,
    });
  } catch (err) {
    console.error('Error fetching joined tracks:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export { getRecentlyTracksController }