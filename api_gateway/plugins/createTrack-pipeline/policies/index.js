const axios = require('axios');
// const  schema = require('./schema.json')


module.exports = {
  name: 'createTrack-pipeline-policy',
  schema: {
  "$id": "http://express-gateway.io/schemas/policies/createTrack-pipeline-policy.json",
  "type": "object",
  "properties": {
    "recommenderUrl": {
      "type": "string",
      "format": "uri"
    },
  },
  "required": ["recommenderUrl"]
},
 policy:  (actionParams) => {
    return async (req, res, next) => {
      try {
        // 1. Lấy dữ liệu từ backend (proxy đã có mapResponse: true)
        const dataFromBackend = res.locals.proxyResponse.body;

        if (!dataFromBackend) {
          return res.status(500).json({ error: 'No data from backend response' });
        }

        const track_id = dataFromBackend.track_id;
        const track_file_name = dataFromBackend.track_file_name;

        // 2. Trả response về client (ngay lập tức)
        res.status(200).json({
          ...dataFromBackend
        });

        // 3. Gọi recommender ở hậu kỳ (ngầm, không ảnh hưởng client)
        const recommenderUrl = actionParams.recommenderUrl;

        const MAX_RETRY = 3;
        let attempt = 0;
        let success = false;

        while (attempt < MAX_RETRY && !success) {
          attempt++;
          try {
            const rsRes = await axios.post(
              recommenderUrl,
              { track_id, track_file_name },
              {
                headers: { 
                  'Content-Type': 'application/json'
                }
              }
            );

            if (rsRes.status === 200) {
              success = true;
              console.log(`[RecommendationPolicy] Recommender add track succeeded on attempt ${attempt}`);
            } else {
              console.warn(`[RecommendationPolicy] Recommender returned status ${rsRes.status} on attempt ${attempt}`);
            }
          } catch (reError) {
            console.error(`[RecommendationPolicy] Attempt ${attempt} - Error calling Recommender:`, reError.message);
          }

          if (!success && attempt < MAX_RETRY) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        if (!success) {
          console.error(`[RecommendationPolicy] Failed to add track after ${MAX_RETRY} attempts. TrackId=${track_id}`);
        }

      } catch (err) {
        console.error('[RecommendationPolicy] Unexpected error:', err.message);
        return res.status(500).json({ error: 'Unexpected server error' });
      }
    };
  }
};