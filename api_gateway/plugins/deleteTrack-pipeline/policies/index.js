const axios = require('axios');
// const  schema = require('./schema.json')


module.exports = {
  name: 'deleteTrack-pipeline-policy',
  schema: {
    "$id": "http://express-gateway.io/schemas/policies/deleteTrack-pipeline-policy.json",
    "type": "object",
    "properties": {
      "recommenderService": {
        "type": "string",
        "format": "uri"
      },
      "backendService": {
        "type": "string",
        "format": "uri"
      }
    },
    "required": ["recommenderService", "backendService"]
  },
  policy: (actionParams) => {
    return async (req, res, next) => {
      // 1. Lấy trackId từ URL (req.params.id)
      const trackId = req.params.id;
      if (!trackId) {
        return res.status(400).json({ error: 'Missing trackId' });
      }

      // 2. Gọi Backend API: Xóa track trên backend
      try {
        const backendUrl = `${actionParams.backendService}/${trackId}`;
        const beRes = await axios.delete(backendUrl);

        // Trả luôn response từ Backend về client (đã xong phần delete ở backend)
        // Chỉ lấy beRes.data hoặc beRes.status nếu cần, không gửi nguyên beRes object
        res.status(beRes.status).json({
          message: 'Backend delete result',
          status: beRes.status,
          data: beRes.data
        });

        // Nếu Backend trả lỗi (status != 200), dừng ở đây
        if (beRes.status !== 200) {
          return;
        }
      } catch (backendError) {
        console.error('[RecommendationPolicy] Error calling backend:', backendError.message);
        // Trả luôn lỗi về client, dừng pipeline
        return res.status(
          backendError.response.status || 500
        ).json({
          error: 'Backend delete failed',
          details: backendError.response.data || backendError.message
        });
      }

      // 3. Nếu xóa backend thành công, tiếp tục "ngầm" gọi Recommender với retry
      const recommenderUrlBase = actionParams.recommenderService; // ví dụ: 'http://recommender:8000/api/deleteTrack/'
      const fullRecommenderUrl = `${recommenderUrlBase}/${trackId}`;

      const MAX_RETRY = 3;
      let attempt = 0;
      let success = false;

      while (attempt < MAX_RETRY && !success) {
        attempt++;
        try {
          const rsRes = await axios.delete(fullRecommenderUrl);
          if (rsRes.status === 200) {
            success = true;
            console.log(`[RecommendationPolicy] Recommender delete succeeded on attempt ${attempt}`);
          } else {
            console.warn(
              `[RecommendationPolicy] Recommender delete returned status ${rsRes.status} on attempt ${attempt}`
            );
          }
        } catch (reError) {
          console.error(
            `[RecommendationPolicy] Attempt ${attempt} - Error calling Recommender:`,
            reError.message
          );
        }

        if (!success && attempt < MAX_RETRY) {
          // Delay ngắn giữa các lần retry (ví dụ 500ms)
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (!success) {
        console.error(
          `[RecommendationPolicy] Failed to delete on Recommender after ${MAX_RETRY} attempts. TrackId=${trackId}`
        );
      }


    };
  }
};