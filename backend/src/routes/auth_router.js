import { Router } from 'express';
const authRouter = Router();
import { registerController, handleUserLoginController, logoutController } from '../controllers/userController.js';
import { authenticateUser } from '../middleware/authMiddleware.js'
import db from '../models/index.js';      // ✅ import toàn bộ models
const { User } = db;   

authRouter.post('/register', registerController);
authRouter.post('/login', handleUserLoginController);
authRouter.get('/me', authenticateUser, async (req, res) => {
  try {
    
    console.log("req.userId:", req.userId); // <== Có tồn tại không
   const user = await User.findByPk(req.userId); // không trả password
 

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
    }
    res.status(200).json({
  id: user.id,        // <-- Sửa từ _id thành id
  name: user.name,    // <-- Có thể trả thêm trường khác nếu cần
  email: user.email
});

  } catch (err) {
    console.error('Lỗi khi lấy thông tin user:', err);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});
authRouter.post('/logout', logoutController);

export default authRouter;

