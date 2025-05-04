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

export { getRecentlyTracksController }