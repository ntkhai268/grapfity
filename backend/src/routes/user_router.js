import { Router } from 'express';
import { getAllUsersController,getUserByIdController, updateUserController, deleteUserController } from '../controllers/userController.js'; //import hàm getAllUsers từ file apiController.js
const router = Router();

router.get('/users', getAllUsersController) //sử dụng hàm getAllUsers để xử lý request cho route /users

router.get('/users/me', getUserByIdController);
// PUT    /api/users/:id
router.put('/users/:id', updateUserController);

// DELETE /api/users/:id
router.delete('/users/:id', deleteUserController);

export default router; //export router để sử dụng ở file khác