import * as rsService from "../services/rs_service.js";
import db from "../models/index.js"

export const getHomeRecommendationsController = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await rsService.recommendForHome(userId);

    res.status(200).json({
      message: "Gợi ý thành công từ trang chính",
      data: result,
    });
  } catch (error) {
    console.error("❌ Lỗi gợi ý trang chính:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi gợi ý bài hát" });
  }
};


export const getTrackRecommendationsController = async (req, res) => {
  try {
    const { trackId } = req.params;
    const result = await rsService.recommendForTrack(trackId);

    res.status(200).json({
      message: "Gợi ý thành công từ bài hát",
      data: result,
    });
  } catch (error) {
    console.error("❌ Lỗi gợi ý từ bài hát:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi gợi ý bài hát" });
  }
};
