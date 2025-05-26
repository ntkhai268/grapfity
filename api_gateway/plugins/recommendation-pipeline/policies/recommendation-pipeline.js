const axios = require('axios');
// const  schema = require('./schema.json')


module.exports = {
  name: 'recommendation-pipeline',
  schema: {
  "$id": "http://express-gateway.io/schemas/plugin/recommendation-pipeline.json",
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
  policy: (params) => {
    return async (req, res, next) => {
      try {
        console.log('Processing recommendation pipeline for:', req.path);
        
        // Step 1: Call recommender service
        const recommenderResponse = await axios({
          method: req.method,
          url: `${params.recommenderService}${req.path}`,
          data: req.body,
          params: req.query,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // Remove problematic headers
            ...Object.fromEntries(
              Object.entries(req.headers).filter(([key]) => 
                !['host', 'connection', 'content-length'].includes(key.toLowerCase())
              )
            )
          },
          timeout: 10000
        });

        console.log('Recommender service response received');
        const recommenderData = recommenderResponse.data;

        // Check if we have tracks to process
        if (!recommenderData.tracks || 
            !Array.isArray(recommenderData.tracks) || 
            recommenderData.tracks.length === 0) {
          console.log('No tracks found, returning recommender response as-is');
          return res.json(recommenderData);
        }

        console.log('Found tracks:', recommenderData.tracks.length);

        // Step 2: Get metadata from backend
        const metadataResponse = await axios.post(
          `${params.backendService}/api/v1/tracks/metadata`,
          { track_ids: recommenderData.tracks },
          {
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 5000
          }
        );

        console.log('Backend metadata response received');

        // Step 3: Combine and return
        const enrichedResponse = {
          ...recommenderData,
          tracks_metadata: metadataResponse.data
        };

        res.json(enrichedResponse);

      } catch (error) {
        console.error('Recommendation pipeline error:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          url: error.config?.url
        });
        
        // Handle different types of errors
        if (error.code === 'ECONNREFUSED') {
          return res.status(503).json({
            error: 'Service unavailable',
            message: 'Unable to connect to recommendation services'
          });
        }

        if (error.code === 'ETIMEDOUT') {
          return res.status(504).json({
            error: 'Gateway timeout',
            message: 'Service request timed out'
          });
        }

        if (error.response) {
          return res.status(error.response.status).json({
            error: 'Service error',
            message: error.response.data || error.message,
            service: error.config?.url?.includes('nginx') ? 'recommender' : 'backend'
          });
        }

        res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to process recommendation request'
        });
      }
    };
  },
};