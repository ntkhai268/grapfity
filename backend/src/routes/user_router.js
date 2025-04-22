import { Router } from 'express';
import { getAllUsersController, updateUserController } from '../controllers/userController.js'; //import hàm getAllUsers từ file apiController.js
const router = Router();

router.get('/users', getAllUsersController) //sử dụng hàm getAllUsers để xử lý request cho route /users
router.put('/update-user/:id', updateUserController) //sử dụng hàm getAllUsers để xử lý request cho route /users
// router.delete('/delete-user/:id', deleteUser) //sử dụng hàm getAllUsers để xử lý request cho route /users

export default router; //export router để sử dụng ở file khác