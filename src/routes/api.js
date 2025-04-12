const express = require('express');
const { getAllUsers, createUser, updateUser, deleteUser } = require('../controllers/apiController.js') //import hàm getAllUsers từ file apiController.js
const router = express.Router();

router.get('/users', getAllUsers) //sử dụng hàm getAllUsers để xử lý request cho route /users
router.post('/create-user', createUser) //sử dụng hàm getAllUsers để xử lý request cho route /users
router.put('/update-user/', updateUser) //sử dụng hàm getAllUsers để xử lý request cho route /users
router.delete('/delete-user/:id', deleteUser) //sử dụng hàm getAllUsers để xử lý request cho route /users

module.exports = router; //export router để sử dụng ở file khác