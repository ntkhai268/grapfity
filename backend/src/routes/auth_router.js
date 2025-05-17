import { Router } from 'express';
const authRouter = Router();
import { registerController, handleUserLoginController } from '../controllers/userController.js';
import { authenticateUser } from '../middleware/authMiddleware.js'

authRouter.post('/register', registerController);
authRouter.post('/login', handleUserLoginController);

export default authRouter;
