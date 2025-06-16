import * as rsService from "../services/rs_service.js";
import db from "../models/index.js"

export const getHomeRecommendationsController = async (req, res) => {
  try {
    console.log(req.userId);
    const userId = req.userId;
    const trackIds = await rsService.recommendForHome(userId);

    const tracks = await db.Track.findAll({
      where: { id: trackIds },
    });

    res.status(200).json({
      message: "Gợi ý thành công từ trang chính",
      data: tracks,
    });
  } catch (error) {
    console.error("❌ Lỗi gợi ý trang chính:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi gợi ý bài hát" });
  }
};

export const getTrackRecommendationsController = async (req, res) => {
  try {
    const { trackId } = req.params;
    const trackIds = await rsService.recommendForTrack(trackId);

    const tracks = await db.Track.findAll({
      where: { id: trackIds },
    });

    res.status(200).json({
      message: "Gợi ý thành công từ bài hát",
      data: tracks,
    });
  } catch (error) {
    console.error("❌ Lỗi gợi ý từ bài hát:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi gợi ý bài hát" });
  }
};