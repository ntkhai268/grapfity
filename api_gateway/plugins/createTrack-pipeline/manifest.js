module.exports = {
  version: '0.1.0',
  init: (pluginContext) => {
    // const policy = require('./policies/recommendation-pipeline-policy'); 
    const policy = require('./policies/index'); 
    pluginContext.registerPolicy(policy);
  },
  policies: ['createTrack-pipeline-policy'],
  schema: {
  "$id": "http://express-gateway.io/schemas/plugins/createTrack-pipeline.json",
}

};

