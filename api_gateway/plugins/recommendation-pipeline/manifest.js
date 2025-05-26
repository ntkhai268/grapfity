

module.exports = {
  version: '0.1.0',
  init: (pluginContext) => {
    const policy = require('./policies/recommendation-pipeline.js'); // Sửa đường dẫn
    pluginContext.registerPolicy(policy);
  },
  policies: ['recommendation-pipeline'],
  schema: {
  "$id": "http://express-gateway.io/schemas/plugin/recommendation-pipeline.json",
}

};

