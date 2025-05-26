const path = require('path');
const gateway = require('express-gateway');

gateway()
  .load(path.join(__dirname, 'config'))
  .run()
  .then(() => {
    console.log('Express Gateway started successfully');
    console.log('Recommendation pipeline policy loaded');
  })
  .catch(error => {
    console.error('Failed to start Express Gateway:', error);
    process.exit(1);
  });