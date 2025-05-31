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
 policy:  (actionParams) => {
     return async (req, res, next) => {
      try {
       
        const trackid =  req.params.id;

        if (!trackid) {
          return res.status(400).json({ error: 'Missing user_id' });
        }

        // Gọi backend API
        const backendUrl = `${actionParams.backendService}${user_id}`;

        const beRes = await axios.delete(backendUrl);

        res.status(beRes.status).json(beRes)

        if (beRes.status != 200){
          return ;
        }

        let reTryCount = 3

        try {
          // Gọi recommender API
          const recommenderUrl = `${actionParams.recommenderService}${trackid}`;
          const rsRes = await axios.delete(recommenderUrl);
          if(rsRes.status != 200 && reTryCount > 0){
            // re try send 

            reTryCount--
          }
        } catch (error) {
 

          if( reTryCount > 0){
            // re try send 
            console.error('Error in recommendation policy:', err.message);
            reTryCount--
          }
        }


        


      } catch (err) {
        console.error('Error in recommendation policy:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
    };
  }
};