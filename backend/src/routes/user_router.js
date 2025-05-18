import { Router } from 'express';
import { getAllUsersController,
     updateUserController,
      deleteUserController,
     getMyProfileController,
     getUserByIdController,
     verifyPasswordController
     } from '../controllers/userController.js'; //import hàm getAllUsers từ file apiController.js
     import { authenticateUser } from '../middleware/authMiddleware.js';
     import { uploadUserImage } from '../middleware/uploadMiddleware.js';
const router = Router();

router.get('/users', getAllUsersController) //sử dụng hàm getAllUsers để xử lý request cho route /users
router.get('/users/me', authenticateUser, getMyProfileController);
router.get('/users/:id', getUserByIdController); 
router.put('/users/me', authenticateUser,uploadUserImage, updateUserController);
router.delete('/delete-user/', deleteUserController) //sử dụng hàm getAllUsers để xử lý request cho route /users
router.post('/verify-password', authenticateUser, verifyPasswordController);


export default router; //export router để sử dụng ở file khác