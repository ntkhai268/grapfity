const express = require('express');
const {getHomepage} = require('../controllers/homeController') //import hàm getHomepage từ file homeController.js
const {getABC} = require('../controllers/homeController') //import hàm getABC từ file homeController.js
const router = express.Router();

router.get('/', getHomepage) //sử dụng hàm getHomepage để xử lý request cho route /home
router.get('/abc', getABC)

module.exports = router; //export router để sử dụng ở file khác