

module.exports = {
  version: '0.1.0',
  init: (pluginContext) => {
    const policy = require('./policies/index'); 
    pluginContext.registerPolicy(policy);
  },
  policies: ['deleteTrack-pipeline-policy'],
  schema: {
  "$id": "http://express-gateway.io/schemas/plugins/deleteTrack-pipeline.json",
}

};

