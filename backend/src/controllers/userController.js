import db from '../models/index.js';
import bcrypt from 'bcrypt';
import {
    getAllUsers,
    createUserService ,
    getUserById,      
    handleUserLogin,
    updateUserService,
    deleteUser as deleteUserService
  } from '../services/user_service.js';
  
import { verityJWT } from '../middleware/JWTActions.js';

const getAllUsersController = async (req, res) => {
  try {
    // 1. Lấy token từ cookie
    const token = req.cookies.jwt;
    let userId = null;
    if (token) {
      const decoded = verityJWT(token);
      userId = decoded.userId;
    }

    // 2. Lấy danh sách users
    const data = await getAllUsers();

    // 3. Trả về response kèm userId
    return res.status(200).json({
      message: 'ok',
      userId,    // đây là userId lấy từ cookie
      data       // mảng users
    });
  } catch (err) {
    console.error('getAllUsersController error:', err);
    // nếu token không hợp lệ cũng coi như unauthorized
    return res.status(401).json({ message: 'Invalid or missing token' });
  }
};

const getUserProfileController = async (req, res) => {
  try {
    const userIdParam = req.params.id;
    console.log("userIdParam: ", userIdParam)
    const currentUserId = req.userId;                

    if (!userIdParam && !currentUserId) {
      return res.status(401).json({ error: 'Unauthorized: Yêu cầu đăng nhập.' });
    }

    const isSelf = !userIdParam || Number(userIdParam) === currentUserId;
    const targetId = userIdParam ? Number(userIdParam) : currentUserId;

    if (isNaN(targetId)) {
      return res.status(400).json({ error: 'ID người dùng không hợp lệ.' });
    }

    const user = await getUserById(targetId, isSelf);

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
    }

    return res.status(200).json({
      message: 'Lấy thông tin người dùng thành công!',
      data: user
    });

  } catch (error) {
    console.error(`Lỗi trong getUserProfileController:`, error);
    return res.status(500).json({ error: 'Lỗi server khi lấy thông tin người dùng.' });
  }
};


const registerController = async (req, res) => {
  try {
    const {
      userName,
      email,
      password,
      roleId,       // Bắt buộc cung cấp
      Name,
      Birthday,
      Address,
      PhoneNumber
    } = req.body;

    // Validate các trường bắt buộc
    if (!userName || !email || !password || roleId === undefined) {
      return res
        .status(400)
        .json({ message: 'userName, email, password và roleId là bắt buộc' });
    }

    // Gọi service tạo user
    const result = await createUserService({
      userName,
      email,
      password,
      roleId ,
      Name,
      Birthday,
      Address,
      PhoneNumber
    });

    // Nếu service trả về thông báo lỗi
    if (result.message === 'Email already exists') {
      return res.status(409).json({ message: 'Email đã tồn tại' });
    }
    if (result.message === 'Username already exists') {
      return res.status(409).json({ message: 'Username đã tồn tại' });
    }

    // Ngược lại, tạo thành công
    return res.status(201).json({
      message: 'Đăng ký thành công',
      data: result
    });
  } catch (err) {
    console.error('registerController error:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};



const handleUserLoginController = async (req, res) => {
    console.log(req.cookies);
    const { username, password } = req.body;
    const data = await handleUserLogin(username, password);
    res.cookie('jwt', data.token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
    return res.status(200).json(data);
};

const updateUserController = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    // Lấy tất cả các field từ body, bao gồm password
    const {
      userName,
      email,
      password,
      roleId,
      Name,
      Birthday,
      Address,
      PhoneNumber
    } = req.body;

    const updatedUser = await updateUserService(
      id,
      userName,
      email,
      password,
      roleId,
      Name,
      Birthday,
      Address,
      PhoneNumber
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Trả về user đã được cập nhật (bao gồm password đã hash)
    return res.status(200).json({
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (err) {
    console.error('updateUserController error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// DELETE /api/users/:id
const deleteUserController = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const rows = await deleteUserService(id);
    if (rows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    console.error('deleteUserController error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


const logoutController = (req, res) => {
  res.clearCookie('jwt'); // tên cookie bạn đang dùng
  req.session?.destroy?.(); // nếu dùng session
  res.status(200).json({ message: 'Đăng xuất thành công' });
};


const verifyPasswordController = async (req, res) => {
  try {
    const userId = req.userId; // ✅ từ middleware authenticateUser
    const { password } = req.body;
        console.log("✅ [verify-password] userId:", userId);
    console.log("✅ [verify-password] password received:", password);

    if (!password) {
      return res.status(400).json({ valid: false, message: 'Thiếu mật khẩu cần xác minh.' });
    }

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ valid: false, message: 'Không tìm thấy người dùng.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    return res.status(200).json({ valid: isMatch });
  } catch (error) {
    console.error('Lỗi xác thực mật khẩu:', error);
    return res.status(500).json({ valid: false, message: 'Lỗi máy chủ khi xác thực mật khẩu.' });
  }
};
export {
    getAllUsersController,
    getUserProfileController,
    registerController,
    handleUserLoginController,
    updateUserController,
    deleteUserController,
    logoutController,
    verifyPasswordController
};
