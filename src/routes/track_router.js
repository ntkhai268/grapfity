const express = require('express');
const { getAllTracksController, createTrackController, updateTrackController, deleteTrackController, getTrackWithUploaderByIdController } = require('../controllers/trackController.js') //import hàm getAllUsers từ file apiController.js
const router = express.Router();

router.get('/tracks', getAllTracksController) //sử dụng hàm getAllUsers để xử lý request cho route /users
router.get('/trackswithuploader/:id', getTrackWithUploaderByIdController) //sử dụng hàm getAllUsers để xử lý request cho route /users
router.post('/create-track', createTrackController) //sử dụng hàm getAllUsers để xử lý request cho route /users
router.put('/update-track/', updateTrackController) //sử dụng hàm getAllUsers để xử lý request cho route /users
router.delete('/delete-track/:id', deleteTrackController) //sử dụng hàm getAllUsers để xử lý request cho route /users

module.exports = router; //export router để sử dụng ở file khác