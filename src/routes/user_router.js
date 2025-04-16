const express = require('express');
const { getAllUsersController, updateUserController } = require('../controllers/userController.js') //import hàm getAllUsers từ file apiController.js
const router = express.Router();

router.get('/users', getAllUsersController) //sử dụng hàm getAllUsers để xử lý request cho route /users
router.put('/update-user/:id', updateUserController) //sử dụng hàm getAllUsers để xử lý request cho route /users
// router.delete('/delete-user/:id', deleteUser) //sử dụng hàm getAllUsers để xử lý request cho route /users

module.exports = router; //export router để sử dụng ở file khác