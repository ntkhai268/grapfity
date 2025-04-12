const express = require('express');
const {getHomepage} = require('../controllers/homeController.js') //import hàm getHomepage từ file homeController.js
const {getABC} = require('../controllers/homeController.js'); //import hàm getABC từ file homeController.js
const { postCreateUser } = require('../controllers/homeController.js');
const { getCreateUser, getUpdateUser, postUpdateUser } = require('../controllers/homeController.js');
const router = express.Router();

router.get('/', getHomepage) //sử dụng hàm getHomepage để xử lý request cho route /home
router.get('/abc', getABC)
router.get('/create', getCreateUser)
router.get('/update/:id', getUpdateUser)
router.post('/update-user/:id', postUpdateUser) //sử dụng hàm getUpdateUser để xử lý request cho route /update/:id
router.post('/create-user', postCreateUser)

module.exports = router; //export router để sử dụng ở file khác