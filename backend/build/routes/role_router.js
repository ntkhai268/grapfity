import express from 'express';
import { getAllUsersController, updateUserController } from '../controllers/userController.js';
const router = express.Router();
router.get('/users', getAllUsersController); // xử lý GET /users
router.put('/update-user/:id', updateUserController); // xử lý PUT /update-user/:id
// router.delete('/delete-user/:id', deleteUser); // nếu cần, hãy export thêm controller này

export default router;