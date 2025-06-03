

module.exports = {
  version: '0.1.0',
  init: (pluginContext) => {
    // const policy = require('./policies/recommendation-pipeline-policy'); 
    const policy = require('./policies/index'); 
    pluginContext.registerPolicy(policy);
  },
  policies: ['recommendation-pipeline-policy'],
  schema: {
  "$id": "http://express-gateway.io/schemas/plugins/recommendation-pipeline.json",
}

};

