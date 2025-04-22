import { Router } from 'express';
const authRouter = Router();
import { createUserController, handleUserLoginController } from '../controllers/userController.js';
import { authenticateUser } from '../middleware/authMiddleware.js'

authRouter.post('/register', createUserController);
authRouter.post('/login', handleUserLoginController);

export default authRouter;
