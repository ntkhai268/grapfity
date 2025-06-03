const axios = require('axios');
// const  schema = require('./schema.json')


module.exports = {
  name: 'recommendation-pipeline-policy',
  schema: {
  "$id": "http://express-gateway.io/schemas/policies/recommendation-pipeline-policy.json",
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
 policy:  (actionParams) => {
     return async (req, res, next) => {
      try {
       
        const user_id = req.query.user_id;

        if (!user_id) {
          return res.status(400).json({ error: 'Missing user_id' });
        }

        const cookie = req.headers.cookie
        const backendJwtUrl = `${actionParams.backendService}/getUserId`

        const response = await axios.get(backendJwtUrl, {
          headers: {
            Cookie: cookie  // truyền cookie tới backend
          }
        });
        const user_id_real = response.data.user_id;
 
        // Gọi recommender API
        const recommenderUrl = `${actionParams.recommenderService}${user_id_real}`;
        
        const rsRes = await axios.get(recommenderUrl);

        const track_ids = rsRes.data
        // const track_ids = [1002,1003,1004,1005,1006,1007, 1008 ,1009,1010]

        // Gọi backend API
        const backendUrl = `${actionParams.backendService}/tracks/getTracksById`;


        const payload = {
            track_ids,
            };

        const beRes = await axios.post(
            backendUrl,
            payload,
            {
                headers: {
                'Content-Type': 'application/json'
                }
            }
            );

        // Trả response về client
        return res.status(200).json(beRes);

      } catch (err) {
        console.error('Error in recommendation policy:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
    };
  }
};